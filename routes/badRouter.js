const router = require('express').Router();
const NotFoundError = require('../errors/not-found-err');

router.get('*', () => {
  throw new NotFoundError('Не известный маршрут/путь.');
});

module.exports = router;
