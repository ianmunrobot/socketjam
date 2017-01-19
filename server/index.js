const path = require('path');

const http = require('http');
const server = http.createServer();
const volleyball = require('volleyball')

const express = require('express');
const app = express();

const socketio = require('socket.io');

server.on('request', app);

const io = socketio(server);

// store the current rooms' data
const memory = {};


server.listen(1337, () => console.log('The server is listening on port 1337!'));

let variable = path.join(__dirname, '../public')

// serve static files
app.use('/paper', express.static(path.join(__dirname, '../node_modules/paper/dist')));
app.use(express.static(path.join(__dirname, '../public')));

app.use(volleyball)

io.on('connection', socket => {
    console.log('New client connection');
    console.log(socket.id);
    // let roomName = req.params.roomName

    // join room on create (room name is passed from client)
    socket.on('create', room => {
      socket.join(room)

      if (!memory[room]) memory[room] = [];
      // iterate through memory, draw the board
      memory[room].forEach(el => {
        io.to(room).emit('otherDrawing', ...el)
      })

      // on 'draw' add to memory and draw to others in room
      socket.to(room).on('draw', (...payload) => {
          memory[room].push(payload);
          io.to(room).emit('otherDrawing', ...payload)
      })

      // log on disconnect
      socket.on('disconnect', () => {
        socket.leave(room);
        console.log('disconnect :()');
      });
    })
  });

app.use('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});
