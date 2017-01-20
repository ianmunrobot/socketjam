const Tone = require('tone')
const EventEmitter = require('./event-emitter')

var socket = io(window.location.origin)
let room = window.location.pathname.slice(1);

// put the socket on global scope (required for paperscript file to access and emit events)
window.socket = socket

// synthesizer memory
let synthesizers = {}

//create a synth and connect it to the master output (your speakers)
var reverb = new Tone.JCReverb(0.25).connect(Tone.Master)

// helper function - change synth frequency
function changeFrequency(id, direction, frequency) {
  synthesizers[id][direction].frequency.value = frequency
}

function attack(id) {
  synthesizers[id].x.triggerAttack(synthesizers[id].x.frequency.value)
  synthesizers[id].y.triggerAttack(synthesizers[id].y.frequency.value)
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
    let newXSynth1 = new Tone.Synth().chain(reverb)
    let newYSynth2 = new Tone.Synth().chain(reverb)
    newXSynth1.volume.value = -12;
    newYSynth2.volume.value = -12;
    synthesizers[id] = {
      x: newXSynth1,
      y: newYSynth2
    }
  })
})

socket.on('mouseDown', (event) => {
  changeFrequency(event.id, 'x', event.x)
  changeFrequency(event.id, 'y', event.y)
  attack(event.id)
})

socket.on('mouseDrag', (event) => {
  changeFrequency(event.id, 'x', event.x)
  changeFrequency(event.id, 'y', event.y)
})

socket.on('mouseUp', (event) => {
  release(event.id)
})
