const express = require('express');
const bodyParser = require('body-parser');

const fileRoutes = require('./routes/file');
const uiPathRoutes = require('./routes/uipath');

const app = express();

app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', '*');
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.append('Access-Control-Allow-Headers', 'Content-Type, X-UIPATH-TenantName, Authorization');
  next();
});

app.use(bodyParser.json({
  verify: function getRawBody(req, res, buf) {
    req.rawBody = buf.toString();
  }
}));

app.use('/file',fileRoutes);
app.use('/uipath',uiPathRoutes);


module.exports = app;