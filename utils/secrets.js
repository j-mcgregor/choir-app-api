const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

module.exports = {
  PORT: process.env.PORT || 4000,
  MONGODB_URI: process.env['MONGODB_URI'],
  MONGODB_URI_LOCAL: process.env['MONGODB_URI_LOCAL'],
  CORS_OPTIONS: {
    origin: 'http://localhost:3000',
    methods: 'GET,PUT,POST,DELETE,OPTIONS',
    headers:
      'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json,x-xsrf-token, multipart/form-data'
  }
};
