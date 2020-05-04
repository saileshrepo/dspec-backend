const env = require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use('/github',require('./routes/routes'))

app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.append('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(bodyParser.json({
  verify: function getRawBody(req, res, buf) {
    req.rawBody = buf.toString();
  }
}));


module.exports = app;