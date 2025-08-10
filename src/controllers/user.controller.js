import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import pkg from '@prisma/client';

const { Role } = pkg;

// Helper: uniform response
function sendResponse(res, success, message, data, errors) {
  return res.json({ success, message, data, errors });
}

export async function listUsers(req, res) {
  try {
    const requester = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let whereClause;
    let selectFields;

    if (requester.role === Role.SUPER_ADMIN) {
      whereClause = { NOT: { role: Role.SUPER_ADMIN } };
      selectFields = { id: true, name: true, email: true, role: true };
    } else if (requester.role === Role.ADMIN) {
      whereClause = { NOT: { role: Role.SUPER_ADMIN } };
      selectFields = { id: true, name: true, email: true, role: true };
    } else {
      whereClause = { role: Role.USER };
      selectFields = { id: true, name: true };
    }

    const total = await prisma.user.count({ where: whereClause });

    const users = await prisma.user.findMany({
      select: selectFields,
      where: whereClause,
      skip,
      take: limit,
    });

    return sendResponse(res, true, 'Users retrieved', {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: users
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return sendResponse(res, false, 'Failed to list users', null, [{ message: errorMessage }]);
  }
}


export async function getUser(req, res) {
  try {
    const requester = req.user;
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

export async function updateUser(req, res) {
  try {
    const requester = req.user;
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    if (requester.id !== id && !(requester.role === Role.ADMIN || requester.role === Role.SUPER_ADMIN)) {
      return sendResponse(res, false, 'Forbidden to update other users', null, []);
    }

    // If role change requested
    if (role) {
      if (requester.role !== Role.SUPER_ADMIN) {
        return sendResponse(res, false, 'Only super admin can change roles', null, []);
      }
      if (role === Role.SUPER_ADMIN) {
        return sendResponse(res, false, 'Cannot assign super admin role', null, []);
      }
    }

    const data = {};
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

export async function deleteUser(req, res) {
  try {
    const requester = req.user;
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

    await prisma.user.delete({ where: { id } });
    return sendResponse(res, true, 'User deleted');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return sendResponse(res, false, 'Failed to delete user', null, [{ message: errorMessage }]);
  }
}
