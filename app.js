const express = require('express');
const app = express();
const cors = require('cors');

const userRoutes = require('./routes/users');
const pointRoutes = require('./routes/points')

app.use(express.json());

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running in port: ${PORT}`);
});

app.use(cors({
  origin: 'https://martinrenz.github.io',  // Permite apenas esse domínio
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

// API Routes
app.use('/users', userRoutes);
app.use('/points', pointRoutes);