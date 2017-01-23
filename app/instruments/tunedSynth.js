const Tone = require('tone')

const reverb = require('../toneCenter').reverb

const socket = require('../socket')

var scale = [
  "F3", "G3", "A3", "Bb3", "C4", "D4", "Eb4",
  "F4", "G4", "A4", "Bb4", "C5", "D5", "Eb5",
  "F5", "G5", "A5", "Bb5", "C6", "D6", "Eb6",
  "F6"
]

module.exports = function(synthesizers) {

  // helper function - change synth frequency
  function changeFrequency(id, name, location) {
    let newIndex = Math.floor((location / view.size.width) * scale.length);
    let newFreq = scale[newIndex]
    synthesizers[id][name].setNote(newFreq)
  }

  function attack(id, location) {
    let newIndex = Math.floor((location / view.size.width) * scale.length);
    let newFreq = scale[newIndex]
    synthesizers[id].synth.triggerAttack(newFreq)
  }

  function release(id) {
    synthesizers[id].synth.triggerRelease()
  }

  socket.on('populateSynths', (ids) => {
    ids.forEach(id => {
      let newSynth = new Tone.DuoSynth({harmonicity: 1.5}).chain(reverb)
      newSynth.volume.value = -15;
      synthesizers[id] = {
        synth: newSynth
      }
    })
  })

  socket.on('serverDown', (event) => {
    // changeFrequency(event.id, 'synth', event.x)
    attack(event.id, event.x)
  })

  socket.on('serverDrag', (event) => {
    changeFrequency(event.id, 'synth', event.x)
  })

  socket.on('serverUp', (event) => {
    release(event.id)
  })
}
