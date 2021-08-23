require('dotenv').config();

const { MONGO_BASE } = process.env;
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const cookieParser = require('cookie-parser');
const { celebrate, Joi, errors } = require('celebrate');
const rateLimit = require('express-rate-limit');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const userRoutes = require('./routes/user');
const movieRoutes = require('./routes/movie');
const { login, createUser, clearToken } = require('./controllers/user');
const auth = require('./middlewares/auth');
const badRouter = require('./routes/badRouter');
const internalServerError = require('./errors/internal-server-err');

const { PORT = 3000 } = process.env;
const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// const allowedCors = [
//   'https://voviii1984.student.nomoredomains.club',
//   'http://voviii1984.student.nomoredomains.club',
// ];

// app.use((req, res, next) => {
//   const { origin } = req.headers; // Сохраняем источник запроса в переменную origin
//   // проверяем, что источник запроса есть среди разрешённых
//   if (allowedCors.includes(origin)) {
//     // устанавливаем заголовок, который разрешает браузеру запросы с этого источника
//     res.header('Access-Control-Allow-Origin', origin);
//     res.header('Access-Control-Allow-Credentials', true);

//     const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';

//     if (req.method === 'OPTIONS') {
//       // разрешаем кросс-доменные запросы любых типов (по умолчанию)
//       res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
//       res.header('Access-Control-Allow-Headers', 'Origin, Content-Type');
//       res.status(204).send();
//     } else next();
//   } else next();
// });

app.use(helmet());
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

mongoose.connect(MONGO_BASE, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(cookieParser());

app.use(requestLogger); // подключаем логгер запросов

app.use(limiter);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
    }),
  }), login);

app.post('/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
      name: Joi.string().min(2).max(30),
    }),
  }), createUser);

app.post('/signout', clearToken);

app.use(auth);

app.use(userRoutes);
app.use(movieRoutes);
app.use(badRouter);

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors()); // обработчик ошибок celebrate
app.use(internalServerError);

app.listen(PORT);
