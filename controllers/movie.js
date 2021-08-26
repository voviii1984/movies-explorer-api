const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const ForbiddenError = require('../errors/forbidden-err');

module.exports = {
  findMovies(req, res, next) {
    Movie.find({})
      .then((movies) => res.send(movies.reverse()))
      .catch(next);
  },
  createMovies(req, res, next) {
    // console.log(req.user._id);
    const {
      country,
      director,
      duration,
      year,
      description,
      image,
      trailer,
      nameRU,
      nameEN,
      thumbnail,
      movieId,
    } = req.body;
    const owner = req.user._id;

    Movie.create({
      country,
      director,
      duration,
      year,
      description,
      image,
      trailer,
      nameRU,
      nameEN,
      thumbnail,
      movieId,
      owner,
    })
      .then((movie) => res.send(movie))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new BadRequestError('Переданы некорректные данные при создании карточки'));
        } else {
          next(err);
        }
      });
  },
  deleteMovies(req, res, next) {
    Movie.findByIdAndDelete(req.params.movieId)
      .then((movie) => {
        if (!movie) {
          throw new NotFoundError('Карточка с указанным _id не найдена.');
        }
        if (movie.owner.toString() !== req.user._id) {
          throw new ForbiddenError('Можно удалять только свои карточки.');
        } else {
          return Movie
            .findByIdAndRemove(req.params.movieId)
            .then(() => res.send(movie));
        }
      })
      .catch((err) => {
        if (err.name === 'CastError') {
          next(new BadRequestError('Переданы некорректные данные карточки'));
        }
        return next(err);
      });
  },
};
