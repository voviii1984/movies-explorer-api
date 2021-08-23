const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getUserProfile,
  updateUser,
} = require('../controllers/user');

router.get('/users/me', getUserProfile);

router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().required().email(),
  }),
}), updateUser);

module.exports = router;
