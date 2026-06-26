const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Model/User.model');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

exports.signin = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed, username });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

    return res.status(201).json({
      message: 'User created',
      token,
      user: { id: user._id, email: user.email, username: user.username }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email, username: user.username }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
