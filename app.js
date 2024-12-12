const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const yaml = require('yaml');

dotenv.config();

const userRoutes = require('./routes/users');
const pointRoutes = require('./routes/points');
const userPoints = require('./routes/userPoints');

app.use(express.json());

const swaggerFile = fs.readFileSync('./swagger.yaml', 'utf8');
const swaggerDocument = yaml.parse(swaggerFile);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running in port: ${PORT}`);
});

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

// API Routes
app.use('/users', userRoutes);
app.use('/points', pointRoutes);
app.use('/user-points', userPoints)