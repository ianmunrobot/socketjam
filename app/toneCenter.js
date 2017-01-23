const Tone = require('tone')

// const synthesizers = {};

//create a main reverb element
const reverb = new Tone.JCReverb(0.25).connect(Tone.Master);

var start = function () {
  StartAudioContext(Tone.context, '#test').then(function(){

  })
}

module.exports = {
  start,
  reverb,
}