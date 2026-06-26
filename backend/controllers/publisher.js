import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken;

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const getHash = async () => {
  if (!password) {
    adminHashCache = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  }
  return adminHashCache;
};

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