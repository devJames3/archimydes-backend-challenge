import { Request, Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

// Helper: uniform response
function sendResponse(res: Response, success: boolean, message: string, data: any = null, errors: any[] = []) {
  return res.json({ success, message, data, errors });
}

export async function listUsers(req: AuthRequest, res: Response) {
  try {
    const requester = req.user!;
    let users;

    if (requester.role === Role.SUPER_ADMIN) {
      // View all users and admins with name, email, role (including admins and users)
      users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true },
        where: {
          NOT: { role: Role.SUPER_ADMIN } // exclude other super admins? Or show them? Your call. Here I exclude others
        }
      });
    } else if (requester.role === Role.ADMIN) {
      // View all users and admins (except super admins)
      users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true },
        where: {
          NOT: { role: Role.SUPER_ADMIN }
        }
      });
    } else {
      // Users can only see list of user names, no email or role
      users = await prisma.user.findMany({
        select: { id: true, name: true },
        where: { role: Role.USER }
      });
    }

    return sendResponse(res, true, 'Users retrieved', users);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return sendResponse(res, false, 'Failed to list users', null, [{ message: errorMessage }]);
  }
}

export async function getUser(req: AuthRequest, res: Response) {
  try {
    const requester = req.user!;
    const { id } = req.params;

    if (requester.role === Role.USER && requester.id !== id) {
      return sendResponse(res, false, 'Forbidden to view other users', null, []);
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: requester.role === Role.USER ? false : true,
        role: requester.role === Role.USER ? false : true,
      }
    });

    if (!user) {
      return sendResponse(res, false, 'User not found', null, []);
    }

    return sendResponse(res, true, 'User retrieved', user);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return sendResponse(res, false, 'Failed to get user', null, [{ message: errorMessage }]);
  }
}

export async function updateUser(req: AuthRequest, res: Response) {
  try {
    const requester = req.user!;
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    // Only allow self or admins/super admin to update
    if (requester.id !== id && !(requester.role === Role.ADMIN || requester.role === Role.SUPER_ADMIN)) {
      return sendResponse(res, false, 'Forbidden to update other users', null, []);
    }

    // If role change requested
    if (role) {
      // Only super admin can change roles and only for non super admin users
      if (requester.role !== Role.SUPER_ADMIN) {
        return sendResponse(res, false, 'Only super admin can change roles', null, []);
      }
      if (role === Role.SUPER_ADMIN) {
        return sendResponse(res, false, 'Cannot assign super admin role', null, []);
      }
    }

    // Prepare data to update
    const data: any = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (password) data.password = await bcrypt.hash(password, 10);
    if (role) data.role = role;

    const updated = await prisma.user.update({
      where: { id },
      data
    });

    return sendResponse(res, true, 'User updated', { id: updated.id, name: updated.name, email: updated.email, role: updated.role });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return sendResponse(res, false, 'Failed to update user', null, [{ message: errorMessage }]);
  }
}

export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    const requester = req.user!;
    const { id } = req.params;

    if (requester.id !== id && requester.role === Role.USER) {
      return sendResponse(res, false, 'Forbidden to delete other users', null, []);
    }

    // Prevent deletion of super admin by anyone but themselves
    const userToDelete = await prisma.user.findUnique({ where: { id } });
    if (!userToDelete) {
      return sendResponse(res, false, 'User not found', null, []);
    }

    if (userToDelete.role === Role.SUPER_ADMIN && requester.id !== id) {
      return sendResponse(res, false, 'Cannot delete super admin', null, []);
    }

    // Admins cannot delete admins (except self)
    if (requester.role === Role.ADMIN && userToDelete.role === Role.ADMIN && requester.id !== id) {
      return sendResponse(res, false, 'Admins cannot delete other admins', null, []);
    }

    // Admins cannot delete super admin (already blocked above)

    await prisma.user.delete({ where: { id } });
    return sendResponse(res, true, 'User deleted');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return sendResponse(res, false, 'Failed to delete user', null, [{ message: errorMessage }]);
  }
}
