const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Load Mongoose User model
const User = require('../models/User');
  
// Secret key for JWT signing
const secretKey = process.env.SECRET_KEY;
  
// Middleware to authenticate and authorize routes
const authenticate = (req, res, next) => {
    const token = req.get('auth');

    // Check if token defined
    if (token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Identify token
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }
  
      req.user = decoded;
      next();
    });
};
  
// Login route
router.post('/login', async(req, res) => {
    // Get username and password from request body
    const { username, password } = req.body;

    // Check if username and password exist
    if (!username || !password) {
      return res.status(400).send('Username and password are required');
    }
  
    // Find the user by username
    const users = await User.find({ username: username });
  	let user = users[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      // Create and sign JWT token
      const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secretKey);
      res.set('auth', token).status(201).json({ token });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Register route
router.post('/register', async(req, res) => {
  try {
    // Get username and encrypted password from request body
    const { username, password } = req.body;

    // Check if username and password exist
    if (!username || !password) {
      return res.status(400).send('Name and password are required');
    }

    // Check if user already exists
    const users = await User.find({ username: username });
    let user = users[0];

    if (user) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = new User({ username, password });
    await newUser.save();

    res.status(201).json({ message: 'Account has been created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
  
// Protected route example
router.get('/protected', authenticate, (req, res) => {
    res.status(201).json({ message: 'Protected route accessed', user: req.user });
});

module.exports = router;
