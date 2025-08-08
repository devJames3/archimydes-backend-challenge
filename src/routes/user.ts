import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { listUsers, getUser, updateUser, deleteUser } from '../controllers/user.controller';

const router = Router();

router.use(authenticate);

router.get('/', listUsers);

// Users can get their own profile, admins/super admins can get any
router.get('/:id', getUser);

// Update user — self or admin/super admin
router.put('/:id', updateUser);

// Delete user — self or admin/super admin with role rules
router.delete('/:id', deleteUser);

export default router;
