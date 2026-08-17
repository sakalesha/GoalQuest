// server/middleware/authenticate.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  let token;
  console.log(`Auth Header: ${req.headers.authorization ? 'Present' : 'Missing'}`);
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log(`Token received, length: ${token.length}`);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key');
      console.log(`Decoded ID: ${decoded.id}`);
      req.user = await User.findById(decoded.id).select('-passwordHash');
      
      if (!req.user) {
        console.log(`User ID ${decoded.id} not found in DB`);
        return res.status(401).json({ message: 'User not found' });
      }
      console.log(`User authenticated: ${req.user.email}`);
      next();
    } catch (error) {
      console.error(`Auth Error: ${error.message}`);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    console.log('No Bearer token found in headers');
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
