require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const http = require('http');
const initSocket = require('./socket');

const port = process.env.PORT || 4000;

const server = http.createServer(app);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    initSocket(server);
    server.listen(port, () => {
      console.log(`Server listening on ${port}`);
    });
  })
  .catch(err => {
    console.error('Mongo connect error', err);
  });
