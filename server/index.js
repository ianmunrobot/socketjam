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

server.listen(port, () => console.log(`The server is listening on port ${port}`));

let variable = path.join(__dirname, '../public')

// serve static files
app.use('/paper', express.static(path.join(__dirname, '../node_modules/paper/dist')));
app.use('/jquery', express.static(path.join(__dirname, '../node_modules/jquery/dist')));
app.use('/bootstrap', express.static(path.join(__dirname, '../node_modules/bootstrap/dist')));
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
        io.to(room).emit('serverDown', inEvent)
        io.to(room).emit('serverDrawDown', inEvent)
      })

      socket.to(room).on('mouseDrag', (inEvent) => {
        io.to(room).emit('serverDrag', inEvent)
        io.to(room).emit('serverDrawDrag', inEvent)
      })

      socket.to(room).on('mouseUp', (event) => {
        io.to(room).emit('serverUp', event)
        io.to(room).emit('serverDrawUp', event)
      })

      socket.to(room).on('synthChange', (event) => {
        io.to(room).emit('newSynth', event)
      })

      // log on disconnect
      socket.on('disconnect', () => {
        socket.leave(room);
        console.log(chalk.yellow(`leaving:\n\t${socket.id}`))
        let deleteIndex = memory[room].indexOf(socket.id)
        if (deleteIndex !== -1) memory[room].splice(deleteIndex)
      });
    })
  });

app.use('/:roomId', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.use('/', (req, res, next) => {
  res.redirect('/1')
})