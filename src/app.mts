import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth.mts';
import userRoutes from './routes/user.mts';
import { errorHandler } from './middleware/errorHandler.mts';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);

app.use(errorHandler);

export default app;
