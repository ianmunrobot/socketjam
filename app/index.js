const Tone = require('tone')

const socket = require('./socket')

const spaceCircle = require('./views/spaceCircle')
const coolBlobs = require('./views/coolBlobs')

const start = require('./toneCenter').start
const duoSynth = require('./instruments/duoSynth');
const tunedSynth = require('./instruments/tunedSynth');

const views = {
	spaceCircle,
	coolBlobs
}

const instruments = {
	duoSynth,
	tunedSynth
}

// main synth memory
const synthesizers = {};

// start with audio defaults
start();
tunedSynth(synthesizers)
const drums = require('./grounds/spacey')

// view click handler
$('#views a').on('click', function(e) {
	console.log(this);
	// update menu
	$('#views li').removeClass('active')
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
	tunedSynth(synthesizers);
})

// instrument click handler
$('#instruments a').on('click', function(e) {
	// update menu
	$('#instruments li').removeClass('active')
	$(this).parent().addClass('active')
	e.preventDefault()
	// reset socket listeners
	socket.removeAllListeners('serverDown');
	socket.removeAllListeners('serverDrag');
	socket.removeAllListeners('serverUp');

	// restart synth
	instruments[this.id](synthesizers)
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
tool.minDistance = 1;
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