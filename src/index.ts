// src/index.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { PORT } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';


const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
