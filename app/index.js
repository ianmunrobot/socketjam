const Tone = require('tone')

const socket = require('./socket')

const spaceCircle = require('./views/spaceCircle')
const coolBlobs = require('./views/coolBlobs')

const start = require('./toneCenter').start
const duoSynth = require('./instruments/duoSynth');
const tunedSynth = require('./instruments/tunedSynth');

const spacey = require('./grounds/spacey')
const junkyard = require('./grounds/junkyard')

const grounds = {
	spacey,
	junkyard
}

const views = {
	spaceCircle,
	coolBlobs
}

const instruments = {
	duoSynth,
	tunedSynth
}

const state = {
	view: 'spaceCircle',
	synth: 'duoSynth',
	ground: ['spacey']
}

// ids of room members
const users = {}

// main synth memory
const synthesizers = {};

// start with audio defaults
start();
instruments[state.synth](synthesizers)

grounds.spacey.start()

// view click handler
$('#views a').on('click', function(e) {
	// update state
	state.view = this.id
	// update menu
	$('#views li').removeClass('active')
	$(this).parent().addClass('active')
	e.preventDefault()
	// reset socket listeners
	socket.removeAllListeners('serverDrawDown');
	socket.removeAllListeners('serverDrawDrag');
	socket.removeAllListeners('serverDrawUp');

	// reset and repopulate view
	project.clear();
	views[state.view]();
})

$('#grounds a').on('click', function(e) {
	e.preventDefault()
	var $parent = $(this).parent();
	// update state
	if ($(this).parent().hasClass('active')) {
		state.ground.splice(state.ground.indexOf(this.id))
		console.log('id', this.id, 'grounds', grounds[this.id]);
		grounds[this.id].stop();
	} else {
		state.ground.push(this.id)
		grounds[this.id].start();
	}
	$(this).parent().toggleClass('active')

})

// instrument click handler
$('#instruments a').on('click', function(e) {
	// update state
	state.synth = this.id
	// update menu
	$('#instruments li').removeClass('active')
	$(this).parent().addClass('active')
	e.preventDefault()

	// reset socket listeners
	socket.removeAllListeners('serverDown');
	socket.removeAllListeners('serverDrag');
	socket.removeAllListeners('serverUp');

	// clear current synths
	clearSynths()
	socket.emit('synthChange', state.synth)
})

socket.on('newSynth', (newSynth) => {
	// restart synth
	clearSynths();
	instruments[newSynth](synthesizers)
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

function clearSynths() {
	Object.keys(synthesizers).forEach(id => {
		Object.keys(synthesizers[id]).forEach(synth => {
			synthesizers[id][synth].dispose()
		})
		synthesizers[id] = {}
	})
}