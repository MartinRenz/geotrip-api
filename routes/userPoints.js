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

// User checkout from point.
router.delete('/', async (req, res) => {
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

    // Check if interaction exists.
    const { rows: existingInteraction } = await db.query(
      'SELECT * FROM user_points WHERE user_id = $1 AND point_id = $2 LIMIT 1',
      [user_id, point_id]
    );

    if (existingInteraction.length === 0) {
      return res.status(404).json({ error: 'Unable to perform checkout.' });
    }

    // Delete the interaction.
    await db.query('DELETE FROM user_points WHERE user_id = $1 AND point_id = $2', [user_id, point_id]);

    res.status(200).json({
      message: 'Checkout performed successfully.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get interactions for a specific point and user.
router.get('/getCheckinInfo', async (req, res) => {
  const { point_id, user_id } = req.query;

  try {
    // Validate if point_id is valid.
    if (!point_id || isNaN(point_id)) {
      return res.status(400).json({ error: 'Point ID is required and must be a number.' });
    }

    // Validate if user_id is valid.
    if (!user_id || isNaN(user_id)) {
      return res.status(400).json({ error: 'User ID is required and must be a number.' });
    }

    // Query to get the total interactions and whether the user has interacted.
    const { rows } = await db.query(
      `
      SELECT 
        COUNT(user_points.id) AS total_interactions,
        MAX(CASE WHEN user_points.user_id = $2 THEN 1 ELSE 0 END) AS user_interacted
      FROM 
        user_points
      WHERE 
        user_points.point_id = $1
      `,
      [point_id, user_id]
    );

    const result = rows[0];

    res.status(200).json({
      message: '',
      data: 
      {
        total_interactions: parseInt(result.total_interactions, 10),
        user_interacted: result.user_interacted === 1,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;