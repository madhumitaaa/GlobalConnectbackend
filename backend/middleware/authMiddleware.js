const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password'); 
    if (!user) {
      return res.status(401).json({ message: 'Invalid token, user not found' });
    }

    req.user = user; 
    next();
  } catch (err) {
    console.error('Protect middleware error:', err.message);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = { protect };
