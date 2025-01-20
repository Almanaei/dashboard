# Step 6: Backend Authentication Setup

## Goal
Implement a secure authentication system using JWT for user login and signup.

---

## Instructions

1. **Create an `AuthController.js` in `backend/controllers`:**
   ```javascript
   const bcrypt = require('bcrypt');
   const jwt = require('jsonwebtoken');
   const { User } = require('../models');

   const register = async (req, res) => {
     try {
       const { name, email, password, role } = req.body;
       const hashedPassword = await bcrypt.hash(password, 10);
       const user = await User.create({ name, email, password: hashedPassword, role });
       res.status(201).json({ message: 'User registered successfully' });
     } catch (error) {
       res.status(400).json({ error: 'Registration failed' });
     }
   };

   const login = async (req, res) => {
     try {
       const { email, password } = req.body;
       const user = await User.findOne({ where: { email } });
       if (!user || !(await bcrypt.compare(password, user.password))) {
         return res.status(401).json({ error: 'Invalid credentials' });
       }
       const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
       res.status(200).json({ token });
     } catch (error) {
       res.status(400).json({ error: 'Login failed' });
     }
   };

   module.exports = { register, login };
