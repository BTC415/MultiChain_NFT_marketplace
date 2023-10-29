import express from 'express'
import bodyParser from 'body-parser'

import dotenv from 'dotenv'
dotenv.config()

import cors from 'cors'
import fileUpload from 'express-fileupload'
import path from 'path';
import Moralis from 'moralis';
import { ETH } from './config';

import routes from './routes'
const { MORALIS_API_KEY } = ETH;

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
// app.use(upload.array())

app.use(fileUpload())

app.use('/api', routes)

app.use('/uploads', express.static(`${__dirname}/build/uploads`));

app.use('/*', (req, res) => {
  res.sendFile(`${__dirname}/build/index.html`)
})

const port = process.env.PORT || 5001
Moralis.start({
  apiKey: MORALIS_API_KEY
})

const server = app.listen(port, () => {
  console.info(`server started on port ${port}`) // eslint-disable-line no-console
})

const io = require("socket.io")(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('join_room', (data) => {
      socket.join(data);
      socket.broadcast.emit("room_created", data);
      console.log(data, "Joined");
  });

  socket.on('new_message', (data) => {
      socket.to(data.roomname).emit('receive_message', data);
      console.log(data);
  });

  socket.on('disconnect', () => {
      console.log('User disconnected.', socket.id);
  });
});
