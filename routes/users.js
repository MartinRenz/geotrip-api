const express = require('express');
const db = require('../config/db');  // Aqui você já tem o DB configurado com o Pool do PostgreSQL
const router = express.Router();
const bcrypt = require('bcrypt');

// Login endpoint.
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate if email is valid.
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // Validate if password is valid.
    if (!password || typeof password !== 'string' || password.trim() === '') {
      return res.status(400).json({ error: 'Password is required.' });
    }

    // Searching user by the email.
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);

    // Returns error if user is not found.
    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found. Try again.' });
    }

    const user = rows[0];

    // Validate the password with bcrypt.
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Login error. Try again.' });
    }

    res.json({ message: 'Login was successful.', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new user endpoint.
router.post('/create', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Validate if username is valid.
    if (!username || typeof username !== 'string' || username.trim() === '') {
      return res.status(400).json({ error: 'Username is required.' });
    }

    // Validate if email is valid.
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // Validate if password is valid.
    if (!password || typeof password !== 'string' || password.trim() === '') {
      return res.status(400).json({ error: 'Password is required.' });
    }

    // Validate if user already exists.
    const { rows: existingUser } = await db.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2 LIMIT 1',
      [email, username]
    );

    if (existingUser.length > 0) {
      return res.status(401).json({ error: 'Email or user already in use.' });
    }

    // Hash of the password.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the database.
    const { rows: result } = await db.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: 'User created successfully.', userId: result[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;