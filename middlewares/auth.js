const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-err');
const { CURRENT_JWT_SECRET } = require('../configs/index');

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    throw new UnauthorizedError('Необходима авторизация.');
  }

  let payload;

  try {
    payload = jwt.verify(
      token,
      CURRENT_JWT_SECRET,
    );
  } catch (err) {
    throw new UnauthorizedError('Необходима авторизация.');
  }
  req.user = payload; // записываем пейлоуд в объект запроса

  return next(); // пропускаем запрос дальше
};
