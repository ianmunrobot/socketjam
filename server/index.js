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
app.use('/socket', express.static(path.join(__dirname, '../node_modules/socket.io-client/dist')));
app.use(express.static(path.join(__dirname, '../public')));

app.use(volleyball)

io.on('connection', socket => {
    console.log('New client connection');
    console.log(socket.id);

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
      // socket.to(room).on('draw', (...payload) => {
      //     memory[room].push(payload);
      //     io.to(room).emit('otherDrawing', ...payload)
      // })

      // on 'draw' add to memory and draw to others in room
      socket.to(room).on('mouseDown', (payload) => {
          console.log('mouseDown');
          console.log(payload);
          const event = {
            id: socket.id,
            x: payload[0],
            y: payload[1]
          }
          io.to(room).emit('mouseDown', event)
      })

      socket.to(room).on('mouseDrag', (payload) => {
          console.log('mouseDrag');
          console.log(payload);
          const event = {
            id: socket.id,
            x: payload[0],
            y: payload[1]
          }
          io.to(room).emit('mouseDrag', event)
      })

      socket.to(room).on('mouseUp', () => {
          console.log('mouseUp');
          io.to(room).emit('mouseUp', socket.id)
      })

      // log on disconnect
      socket.on('disconnect', () => {
        socket.leave(room);
        console.log('before', memory[room]);
        let deleteIndex = memory[room].indexOf(socket.id)
        if (deleteIndex !== -1) memory[room].splice(deleteIndex)
        console.log('after', memory[room]);
        console.log('disconnect :()');
      });
    })
  });

app.use('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});
