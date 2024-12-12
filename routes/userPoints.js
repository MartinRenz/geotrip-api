const express = require('express');
const db = require('../config/db');
const router = express.Router();

// User checkin with point.
router.post('/', async (req, res) => {
  const { user_id, point_id } = req.body;

  try {
    // Validate if user_id is valid.
    if (!user_id || typeof user_id !== 'number') {
      return res.status(400).json({ error: 'User ID is required and must be a number.' });
    }

    // Validate if point_id is valid.
    if (!point_id || typeof point_id !== 'number') {
      return res.status(400).json({ error: 'Point ID is required and must be a number.' });
    }

    // Validate if user already has interacted with the point.
    const { rows: existingInteraction } = await db.query(
      'SELECT * FROM user_points WHERE user_id = $1 AND point_id = $2 LIMIT 1',
      [user_id, point_id]
    );

    if (existingInteraction.length > 0) {
      return res.status(409).json({ error: 'User already interacted with this point.' });
    }

    // Insert the interaction in the user_points table.
    const { rows: newInteraction } = await db.query(
      'INSERT INTO user_points (user_id, point_id) VALUES ($1, $2) RETURNING id, user_id, point_id',
      [user_id, point_id]
    );

    res.status(201).json({
      message: 'Interaction created successfully.',
      data: newInteraction[0],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;