const express = require('express')
const app = express();

const auth = require('./Controllers/authController');

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.listen((process.env.PORT || 8000), () => {
  console.log('Example app listening on port 8000!')
});

app.use('/auth', auth);