const express = require('express');
const cors = require('cors');

const usersRouter = require('./routes/users');
const conversationRouter= require('./routes/conversations');
const messageRouter= require('./routes/messages');

const app = express();

app.use(cors());
app.use(express.urlencoded({extended : true}));
app.use(express.json());

app.get('/hello', (req, res) => {
  res.send('hello, world');
});

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/conversations', conversationRouter);
app.use('/api/v1/messages', messageRouter);

module.exports = app;
