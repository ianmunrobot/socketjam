const Tone = require('tone')

// const synthesizers = require('../toneCenter')
// console.log('in duo', synthesizers);

const socket = require('../socket')

module.exports = function(synthesizers) {

  //create a synth and connect it to the master output (your speakers)
  var reverb = new Tone.JCReverb(0.25).connect(Tone.Master);

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

  socket.on('serverDown', (event) => {
    changeFrequency(event.id, 'x', event.x)
    changeFrequency(event.id, 'y', event.x * 1.5)
    attack(event.id)
  })

  socket.on('serverDrag', (event) => {
    let amplitude = Math.abs(event.delta[1]) + Math.abs(event.delta[2])
    changeAmplitude(event.id, amplitude)
    changeFrequency(event.id, 'x', event.x)
    changeFrequency(event.id, 'y', event.x * 1.5)
  })

  socket.on('serverUp', (event) => {
    release(event.id)
  })

}
