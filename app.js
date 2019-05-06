const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const routes = require('./router');
const errorHandlers = require('./helpers/errorHandlers');
const { getToken } = require('./service/ocapiService');

const app = express();

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret:'secretTokens',
  resave: true,
  saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(getToken);

app.use('/', routes);

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

/* Development Error Handler - Prints stack trace */
app.use(errorHandlers.developmentErrors);


// production error handler
//app.use(errorHandlers.productionErrors);


module.exports = app;