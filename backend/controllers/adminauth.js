import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

let adminHashCache = null;

const getAdminHash = async () => {
  if (!adminHashCache) {
    adminHashCache = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  }
  return adminHashCache;
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const isValidAdmin = email === DEFAULT_ADMIN_EMAIL;
    const isValidPassword = await bcrypt.compare(password, await getAdminHash());

    if (!isValidAdmin || !isValidPassword) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const token = jwt.sign(
      { email, role: 'admin' },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: { email, role: 'admin' },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

