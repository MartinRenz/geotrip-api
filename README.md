# Geotrip API

Geotrip API is a Node.js and Express-based web API built to support the Geotrip project, providing map-based functionality like point of interest (POI) management and user interactions. The API is backed by a MySQL database.

## Features
- Create, update, delete, and retrieve points of interest.
- Manage users and their interactions with POIs.
- Query POIs based on location coordinates.

## Getting Started

### Prerequisites
Ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MySQL](https://www.mysql.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/geotrip-api.git
   cd geotrip-api

2. **Install dependencies:**
   ```bash
   npm install

3. **Create a .env file:**
   ```bash
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=geotrip

4. **Running the Application:**
   ```bash
   node app.js

The application will run on port 3000 by default.

## Usage

You can test the API using tools like **Postman** or **curl**. The API documentation is currently in development.
