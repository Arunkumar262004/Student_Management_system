const jwt = require('jsonwebtoken');

const { User } = require('../models');

// Verify JWT and attach user to req
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided. Please login.' });
    }

    const token   = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User account no longer exists.' });
    }

    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Check user has the required role
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Only ${allowedRoles.join(' or ')} can perform this action.`,
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };