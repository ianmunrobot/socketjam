const Tone = require('tone')

const socket = require('./socket')
const spaceCircle = require('./views/spaceCircle')
const coolBlobs = require('./views/coolBlobs')

const canvas = document.getElementById('paperCanvas');
paper.setup(canvas);
paper.install(window);

// const drums = require('./basic-beat')
let room = window.location.pathname.slice(1);

// synthesizer memory
let synthesizers = {}

//create a synth and connect it to the master output (your speakers)
var reverb = new Tone.JCReverb(0.25).connect(Tone.Master)

// helper function - change synth frequency
function changeFrequency(id, direction, frequency) {
  synthesizers[id][direction].frequency.value = frequency
}

function changeAmplitude(id, amplitude) {
  // var newAmp = amplitude * -3
  // console.log('newAmp:', newAmp);
  // synthesizers[id].x.volume.value = newAmp;
  // synthesizers[id].y.volume.value = newAmp;
}

function attack(id) {
  synthesizers[id].x.triggerAttack(synthesizers[id].x.frequency.value)
  synthesizers[id].y.triggerAttack(synthesizers[id].x.frequency.value * 1.5)
}

function release(id) {
  synthesizers[id].x.triggerRelease()
  synthesizers[id].y.triggerRelease()
}

// on connection, emit event to join a specific room
socket.on('connect', () => {
    socket.emit('create', room);
});

socket.on('populateSynths', (ids) => {
  ids.forEach(id => {
    let newXSynth1 = new Tone.DuoSynth({harmonicity: 1.5}).chain(reverb)
    let newYSynth2 = new Tone.DuoSynth({harmonicity: 1.5}).chain(reverb)
    newXSynth1.volume.value = -15;
    newYSynth2.volume.value = -15;
    synthesizers[id] = {
      x: newXSynth1,
      y: newYSynth2
    }
  })
})

socket.on('mouseDown', (event) => {
  changeFrequency(event.id, 'x', event.x)
	changeFrequency(event.id, 'y', event.x * 1.5)
  attack(event.id)
})

socket.on('mouseDrag', (event) => {
  // console.log(event);
  let amplitude = Math.abs(event.delta[1]) + Math.abs(event.delta[2])
  changeAmplitude(event.id, amplitude)
  changeFrequency(event.id, 'x', event.x)
  changeFrequency(event.id, 'y', event.x * 1.5)
})

socket.on('mouseUp', (event) => {
  release(event.id)
})

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

coolBlobs();