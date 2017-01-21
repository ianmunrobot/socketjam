const path = require('path');

const http = require('http');
const server = http.createServer();
const volleyball = require('volleyball')

const express = require('express');
const app = express();
const socketio = require('socket.io');
const chalk = require('chalk')

server.on('request', app);

const io = socketio(server);

// store the current rooms' data
const memory = {};

var port = process.env.PORT || 1337

server.listen(port, () => console.log('The server is listening on port 1337!'));

let variable = path.join(__dirname, '../public')

// serve static files
app.use('/paper', express.static(path.join(__dirname, '../node_modules/paper/dist')));
app.use('/startaudiocontext', express.static(path.join(__dirname, '../node_modules/startaudiocontext')));
app.use('/socket', express.static(path.join(__dirname, '../node_modules/socket.io-client/dist')));
app.use(express.static(path.join(__dirname, '../public')));

app.use(volleyball)

io.on('connection', socket => {
    console.log(chalk.blue('New client connection'));
    console.log(chalk.blue(socket.id));

    // join room on create (room name is passed from client)
    socket.on('create', room => {
      console.log('room', room);
      socket.join(room)
      // io.to(room).emit('created', socket.id)

      if (!memory[room]) memory[room] = [];
      memory[room].push(socket.id)
      // dispatch the current synths (including self)
      io.to(room).emit('populateSynths', memory[room])


      // on 'draw' add to memory and draw to others in room
      socket.to(room).on('mouseDown', (inEvent) => {
        io.to(room).emit('mouseDown', inEvent)
      })

      socket.to(room).on('mouseDrag', (inEvent) => {
        io.to(room).emit('mouseDrag', inEvent)
      })

      socket.to(room).on('mouseUp', (event) => {
          io.to(room).emit('mouseUp', event)
      })

      // log on disconnect
      socket.on('disconnect', () => {
        socket.leave(room);
        console.log(chalk.yellow(`leaving: ${socket.id}`))
        let deleteIndex = memory[room].indexOf(socket.id)
        if (deleteIndex !== -1) memory[room].splice(deleteIndex)
      });
    })
  });

app.use('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});
