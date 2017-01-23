const Tone = require('tone')

const socket = require('./socket')
const spaceCircle = require('./views/spaceCircle')
const coolBlobs = require('./views/coolBlobs')

const synths = require('./toneCenter').start
const duoSynth = require('./toneCenter').duoSynth

const views = {
	spaceCircle,
	coolBlobs
}

const synthesizers = {}

synths(synthesizers)

$('a').on('click', function(e) {
	e.preventDefault()
	socket.removeAllListeners('serverDown');
	socket.removeAllListeners('serverDrag');
	socket.removeAllListeners('serverUp');
	project.clear();
	views[this.id]();
	duoSynth(synthesizers);
})

const drums = require('./basic-beat')

// set up canvas
const canvas = document.getElementById('paperCanvas');
paper.setup(canvas);
paper.install(window);

spaceCircle();

let room = window.location.pathname.slice(1);

// on connection, emit event to join a specific room
socket.on('connect', () => {
	socket.emit('create', room);
});

// drawing tool
var tool = new Tool()
tool.minDistance = 10;
tool.maxDistance = 30;

tool.onMouseDown = (event) => {
	var outEvent = {
		id: socket.id,
		x: event.point.x,
		y: event.point.y,
	}
  socket.emit('mouseDown', outEvent);
}

tool.onMouseDrag = (event) => {
	var outEvent = {
		id: socket.id,
		x: event.point.x,
		y: event.point.y,
		delta: event.delta,
		middlePoint: event.middlePoint,
	}
  socket.emit('mouseDrag', outEvent)
}

tool.onMouseUp =(event) => {
	var outEvent = {
		id: socket.id,
		x: event.point.x,
		y: event.point.y,
	}
  socket.emit('mouseUp', outEvent)
}