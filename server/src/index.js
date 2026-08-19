import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import commissionRoutes from './routes/commissions.js';
import clientRoutes from './routes/clients.js';
import priceRoutes from './routes/prices.js';
import publicRoutes from './routes/public.js';
import userRoutes from './routes/users.js';
import expenditureRoutes from './routes/expenditures.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Public routes (no auth)
app.use('/api', publicRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// Protected admin routes
app.use('/api/commissions', commissionRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenditures', expenditureRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
