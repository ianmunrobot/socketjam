const Tone = require('tone')

const socket = require('./socket')

const spaceCircle = require('./views/spaceCircle')
const coolBlobs = require('./views/coolBlobs')

const start = require('./toneCenter').start
const duoSynth = require('./instruments/duoSynth');

const views = {
	spaceCircle,
	coolBlobs
}

// main synth memory
const synthesizers = {};

// start with audio defaults
start();
duoSynth(synthesizers)
const drums = require('./basic-beat')

// menu click handler
$('a').on('click', function(e) {
	// update menu
	$('li').removeClass('active')
	$(this).parent().addClass('active')
	e.preventDefault()
	// reset socket listeners
	socket.removeAllListeners('serverDown');
	socket.removeAllListeners('serverDrag');
	socket.removeAllListeners('serverUp');

	// reset and repopulate view
	project.clear();
	views[this.id]();

	// restart synth
	duoSynth(synthesizers);
})

// set up canvas
const canvas = document.getElementById('paperCanvas');
paper.setup(canvas);
paper.install(window);

// begin view default
spaceCircle();

let room = window.location.pathname.slice(1);

// on connection, emit event to join a specific room
socket.on('connect', () => {
	socket.emit('create', room);
});

// drawing tool emitters
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