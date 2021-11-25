const router = require('express').Router();
const { updateUserValidator } = require('../middlewares/validations');

const {
  getUserProfile,
  updateUser,
  clearToken,
} = require('../controllers/user');

router.get('/users/me', getUserProfile);

router.patch('/users/me', updateUserValidator, updateUser);

router.post('/users/signout', clearToken);

module.exports = router;
