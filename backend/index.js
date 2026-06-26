import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});