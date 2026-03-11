const jwt                = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const { User } = require('../models');

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role: role || 'teacher',
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      token,
      user: {
        id:    newUser.id,
        name:  newUser.name,
        email: newUser.email,
        role:  newUser.role,
      },
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    return res.json({
      token,
      user: {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};

// GET /api/auth/me
const getMe = (req, res) => {
  return res.json({
    user: {
      id:    req.user.id,
      name:  req.user.name,
      email: req.user.email,
      role:  req.user.role,
    },
  });
};

module.exports = { register, login, getMe };