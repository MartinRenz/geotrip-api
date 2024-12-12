const express = require('express');
const db = require('../config/db');
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

router.put('/edit', async (req, res) => {
  const { userId, updatedFields } = req.body;

  if (!userId || typeof userId !== 'number') {
    return res.status(400).json({ error: 'Valid userId is required.' });
  }

  if (!updatedFields || typeof updatedFields !== 'object') {
    return res.status(400).json({ error: 'Updated fields must be an object.' });
  }

  let updateQuery = 'UPDATE users SET ';
  const queryParams = [];
  const fieldsToUpdate = [];

  if (updatedFields.username) {
    if (typeof updatedFields.username !== 'string' || updatedFields.username.trim() === '') {
      return res.status(400).json({ error: 'Username is required.' });
    }
    
    const { rows: usernameCheck } = await db.query('SELECT * FROM users WHERE username = $1 AND id != $2', [updatedFields.username, userId]);
    if (usernameCheck.length > 0) {
      return res.status(400).json({ error: 'Username is already in use.' });
    }

    fieldsToUpdate.push('username = $' + (fieldsToUpdate.length + 1));
    queryParams.push(updatedFields.username);
  }

  if (updatedFields.email) {
    if (typeof updatedFields.email !== 'string' || updatedFields.email.trim() === '') {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const { rows: emailCheck } = await db.query('SELECT * FROM users WHERE email = $1 AND id != $2', [updatedFields.email, userId]);
    if (emailCheck.length > 0) {
      return res.status(400).json({ error: 'E-mail is already in use.' });
    }

    fieldsToUpdate.push('email = $' + (fieldsToUpdate.length + 1));
    queryParams.push(updatedFields.email);
  }

  if (updatedFields.password) {
    if (typeof updatedFields.password !== 'string' || updatedFields.password.trim() === '') {
      return res.status(400).json({ error: 'Password is required.' });
    }

    const hashedPassword = await bcrypt.hash(updatedFields.password, 10);
    fieldsToUpdate.push('password = $' + (fieldsToUpdate.length + 1));
    queryParams.push(hashedPassword);
  }

  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update.' });
  }

  updateQuery += fieldsToUpdate.join(', ') + ' WHERE id = $' + (fieldsToUpdate.length + 1);
  queryParams.push(userId);

  try {
    const { rows: result } = await db.query(updateQuery, queryParams);

    res.status(200).json({ message: 'User updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/getbyid/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Validate if id is a valid number.
    if (!id || isNaN(id) || id <= 0) {
      return res.status(400).json({ message: 'ID is required and must be a positive number.' });
    }

    // Search for the user by ID using PostgreSQL parameterized query.
    const { rows } = await db.query('SELECT id, username, email FROM users WHERE id = $1 LIMIT 1', [id]);

    // Check if the user exists.
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'User found.', user: rows[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;