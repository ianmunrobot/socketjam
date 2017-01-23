const Tone = require('tone')

// const synthesizers = {};

const duoSynth = require('./instruments/duoSynth')

var start = function (synthesizers) {
  StartAudioContext(Tone.context, '#test').then(function(){

  })
  duoSynth(synthesizers);
}

module.exports = {
  start,
  duoSynth,
}