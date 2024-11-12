const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Get point of interest by ID endpoint.
router.get('/getbyid/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Validate if id is a valid number.
    if (!id || isNaN(id) || id <= 0) {
      return res.status(400).json({ message: 'ID is required.' });
    }

    // Search for the point by ID.
    const [point] = await db.query(
      'SELECT * FROM points WHERE id = ? LIMIT 1',
      [id]
    );

    // Check if the point exists.
    if (point.length === 0) {
      return res.status(404).json({ message: 'Point of interest not found.' });
    }

    res.json({ message: 'Point of interest found.', point: point[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get point of interest by name endpoint
router.get('/getbyname/:name', async (req, res) => {
  const { name } = req.params;

  try {
    // Validate if name is provided and valid
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ message: 'Name is required.' });
    }

    // Search for points with similar names
    const [points] = await db.query(
      'SELECT * FROM points WHERE name LIKE ? LIMIT 10',
      [`%${name}%`]
    );

    // Return the founding point/points
    res.json({ message: '', points });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get point of interest by coordinates endpoint.
router.post('/getbycoordinates', async (req, res) => {
  const { northEast, southWest } = req.body;

  // Check if values are empty.
  if (!northEast || !southWest) {
    return res.status(400).json({ message: 'northEast and southWest coordinates are required.' });
  }

  // Validate northEast and southWest properties.
  if (
    !northEast.latitude || typeof northEast.latitude !== 'number' ||
    !northEast.longitude || typeof northEast.longitude !== 'number' ||
    !southWest.latitude || typeof southWest.latitude !== 'number' ||
    !southWest.longitude || typeof southWest.longitude !== 'number'
  ) {
    return res.status(400).json({ message: 'Coordinates must be valid numbers for latitude and longitude.' });
  }

  // Verifica se as coordenadas estão no formato correto (latitude entre -90 e 90, longitude entre -180 e 180)
  if (
    northEast.latitude < -90 || northEast.latitude > 90 ||
    northEast.longitude < -180 || northEast.longitude > 180 ||
    southWest.latitude < -90 || southWest.latitude > 90 ||
    southWest.longitude < -180 || southWest.longitude > 180
  ) {
    return res.status(400).json({ message: 'Coordinates must be within valid ranges: latitude (-90 to 90), longitude (-180 to 180).' });
  }

  try {
    const [points] = await db.query(
      `SELECT * FROM points WHERE 
        latitude BETWEEN ? AND ? AND 
        longitude BETWEEN ? AND ?
      LIMIT 10`,
      [
        southWest.latitude, northEast.latitude,
        southWest.longitude, northEast.longitude
      ]
    );

    res.json({ message:"", points });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create point of interest endpoint.
router.post('/', async (req, res) => {
  const { name, latitude, longitude, user_id } = req.body;

  try {
    // Validate if name is valid.
    if (!name || typeof name !== 'string' || name.trim() === '') 
    {
      return res.status(400).json({ message: 'Name is required.' });
    }

    // Validate if latitude is valid
    if (typeof latitude !== 'number' || isNaN(latitude) || latitude < -90 || latitude > 90) {
      return res.status(400).json({ message: 'Latitude must be a valid number between -90 and 90.' });
    }

    // Validate if longitude is valid
    if (typeof longitude !== 'number' || isNaN(longitude) || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: 'Longitude must be a valid number between -180 and 180.' });
    }

    // Validate if user_id is valid.
    if (user_id === undefined || user_id === null || isNaN(user_id) || user_id <= 0)
    {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    // Validate if point already exists.
    const [existingPoint] = await db.query(
      'SELECT * FROM points WHERE latitude = ? AND longitude = ? LIMIT 1', 
      [latitude, longitude]
    );
    
    if (existingPoint.length > 0) {
      return res.status(400).json({ message: 'Latitude and longitude already in use by other point.' });
    }

    // Validate if point already exists.
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE id = ?', 
      [user_id]
    );

    if (existingUser.length == 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const [result] = await db.query(
      'INSERT INTO points (name, latitude, longitude, user_id) VALUES (?, ?, ?, ?)',
      [name, latitude, longitude, user_id]
    );
    
    res.json({ message: 'Point of interest created successfully.', point_id: result.point_id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete point of interest endpoint.
router.delete('/', async (req, res) => {
  const { point_id } = req.body;

  try {
    // Validate if point_id is valid.
    if (point_id === undefined || point_id === null || isNaN(point_id) || point_id <= 0)
    {
      return res.status(400).json({ message: 'Point ID is required.' });
    }

    // Validate if point already exists.
    const [existingPoint] = await db.query(
      'SELECT * FROM points WHERE id = ? LIMIT 1', 
      [point_id]
    );
    
    if (existingPoint.length == 0) {
      return res.status(404).json({ message: 'Point not found.' });
    }

    const [result] = await db.query(
      'DELETE FROM points WHERE id = ?',
      [point_id]
    );
    
    res.json({ message: 'Point of interest deleted successfully.', point_id: result.point_id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get point of interest by coordinates endpoint.

module.exports = router;