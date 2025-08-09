import { Router } from 'express';
import { authenticate } from '../middleware/auth.mts';
import { validate } from '../middleware/validate.mts';
import { updateUserSchema } from '../validations/user.mts';
import { listUsers, getUser, updateUser, deleteUser } from '../controllers/user.controller.mts';

const router = Router();

router.use(authenticate);

router.get('/', listUsers);

// Users can get their own profile, admins/super admins can get any
router.get('/:id', getUser);

// Update user — self or admin/super admin
router.put('/:id', validate(updateUserSchema), updateUser);

// Delete user — self or admin/super admin with role rules
router.delete('/:id', deleteUser);

export default router;
