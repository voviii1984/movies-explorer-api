const router = require('express').Router();
const { updateUserValidator } = require('../middlewares/validations');

const {
  getUserProfile,
  updateUser,
} = require('../controllers/user');

router.get('/users/me', getUserProfile);

router.patch('/users/me', updateUserValidator, updateUser);

module.exports = router;
