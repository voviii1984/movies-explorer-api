const { NODE_ENV, JWT_SECRET } = process.env;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const UnauthorizedError = require('../errors/unauthorized-err');
const BadRequestError = require('../errors/bad-request-err');
const ConflictError = require('../errors/conflict-err');

module.exports = {
  getUserProfile(req, res, next) {
    User.findById(req.user._id)
      .then((user) => res.send(user))
      .catch(next);
  },
  createUser(req, res, next) {
    const {
      name,
      email,
      password,
    } = req.body;

    bcrypt
      .hash(password, 12)
      .then((hash) => User.create({
        name,
        email,
        password: hash, // записываем хеш в базу
      }))
      .then((user) => res.send({
        name,
        email,
        _id: user._id,
      }))
      .catch((err) => {
        if (err.name === 'MongoError' && err.code === 11000) {
          next(new ConflictError('Данный email зарегестрирован в системе'));
        } else if (err.name === 'ValidationError') {
          next(new BadRequestError('Переданы некорректные данные при создании профиля.'));
        }
        return next(err);
      });
  },
  login(req, res, next) {
    const { email, password } = req.body;
    User.findOne({ email })
      .select('+password')
      .then((user) => {
        if (!user) {
          throw new UnauthorizedError('Неправильные почта или пароль.');
        }

        return bcrypt
          .compare(password, user.password)
          .then((matched) => {
            if (!matched) {
              throw new UnauthorizedError('Неправильные почта или пароль.');
            }

            const token = jwt.sign(
              { _id: user._id },
              NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
              { expiresIn: '7d' },
            );
            return res
              .cookie('jwt', token, {
                maxAge: 3600000 * 24 * 7,
                httpOnly: true,
                sameSite: 'none',
                secure: true,
              })
              .send({ message: 'Вы успешно авторизованны!' });
          });
      })
      .catch(next);
  },
  updateUser(req, res, next) {
    const { name, email } = req.body;

    User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
      .then((user) => {
        if (!user) {
          throw new NotFoundError('Пользователь с указанным _id не найден.');
        }
        return res.send(user);
      })
      .catch((err) => {
        if (err.name === 'CastError') {
          next(new BadRequestError('Переданы некорректные данные при обновлении профиля.'));
        }
        return next(err);
      });
  },
  clearToken(req, res) {
    res.clearCookie('jwt').send({ message: 'Токен удален!!!' });
  },
};
