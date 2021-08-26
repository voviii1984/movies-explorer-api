const router = require('express').Router();
const { createMoviesValidator, deleteMoviesValidator } = require('../middlewares/validations');

const {
  findMovies,
  createMovies,
  deleteMovies,
} = require('../controllers/movie');

router.get('/movies', findMovies);

router.post('/movies', createMoviesValidator, createMovies);

router.delete('/movies/:movieId', deleteMoviesValidator, deleteMovies);

module.exports = router;
