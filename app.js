const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressValidator = require('express-validator');
const passport = require('passport');
const cors = require('cors');

const { PORT } = require('./utils/secrets');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(methodOverride('_method')); //for the "delete" post request in files

//error validator
app.use(
  expressValidator({
    errorFormatter: function(param, msg, value) {
      var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);

//passport init
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
require('./config').passport(passport); //set passport from config

//routes

//index route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/build/index.html'));
});

//favicon route
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/build/favicon.ico'));
});

//manifest route
app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/build/manifest.json'));
});

//users route
const usersRoute = require('./routes/users');
app.use('/users', usersRoute);

//files route
const filesRoute = require('./routes/files');
app.use('/files', filesRoute);

//statics route;
const staticsRoute = require('./routes/statics');
app.use('/static', staticsRoute);

app.listen(PORT, () => console.log(`Server started on ${PORT}!`));
