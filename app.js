const express = require('express');
const app = express();
const cors = require('cors');

const userRoutes = require('./routes/users');
const pointRoutes = require('./routes/points')

app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'DELETE'],
}));

app.use(express.json());

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running in port: ${PORT}`);
});

// API Routes
app.use('/users', userRoutes);
app.use('/points', pointRoutes);