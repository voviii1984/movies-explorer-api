const router = require('express').Router();

const { login, createUser, clearToken } = require('../controllers/user');
const { signinValidator, signupValidator } = require('../middlewares/validations');
const auth = require('../middlewares/auth');
const userRoutes = require('./user');
const movieRoutes = require('./movie');
const badRouter = require('./badRouter');

router.post('/signin', signinValidator, login);

router.post('/signup', signupValidator, createUser);

router.post('/signout', clearToken);

router.use(auth);

router.use(userRoutes);
router.use(movieRoutes);
router.use(badRouter);

module.exports = router;
