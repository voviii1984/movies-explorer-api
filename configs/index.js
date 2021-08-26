require('dotenv').config();

const { NODE_ENV, JWT_SECRET, MONGO_BASE } = process.env;

const CURRENT_JWT_SECRET = NODE_ENV === 'production' && JWT_SECRET ? JWT_SECRET : 'dev-secret';
const moviesdb = NODE_ENV === 'production' && MONGO_BASE ? MONGO_BASE : 'mongodb://localhost:27017/myapp';

module.exports = {
  moviesdb,
  CURRENT_JWT_SECRET,
};
