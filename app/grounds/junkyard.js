const Tone = require('tone');


// general drum compressor
var drumCompress = new Tone.Compressor({
		"threshold" : -15,
		"ratio" : 6,
		"attack" : 0.3,
		"release" : 0.1
	}).connect(Tone.Master)

// low drum part
var drum1 = new Tone.MembraneSynth({
  "pitchDecay" : 0.016,
  "octaves" : 2,
  "envelope" : {
    "attack" : 0.006,
    "decay" : 0.5,
    "sustain" : 0
  },
  "volume": -3
}).chain(drumCompress);


var membranePart = new Tone.Sequence(function(time, pitch){
  drum1.triggerAttack(pitch, time, Math.random()*0.5 + 0.5);
}, ["F2", 'F3', "Eb3", "C3", null, "C3", null, "Eb2"], "8n")
membranePart.loop = true;
membranePart.loopEnd = "1m";


// high drum part
var drum2 = new Tone.MembraneSynth({
  "pitchDecay" : 0.02,
  "octaves" : 10,
  "envelope" : {
    "attack" : 0.006,
    "decay" : 0.5,
    "sustain" : 0
  },
  "volume": -10
}).chain(drumCompress);

var dingPart = new Tone.Part(function(time, event){
		if (Math.random() < event.prob){
			drum2.triggerAttackRelease(event.note, event.dur, time);
		}
	}, [
      {time : "0:0", note : "C5", dur : "4n + 8n", prob: 1},
      {time : "0:2", note : "C5", dur : "8n", prob : 0.6},
      {time : "0:2 + 4t", note : "C5", dur : "8n", prob : 0.4},
      {time : "0:2 + 4t*2", note : "C5", dur : "8n", prob : 0.9},
      {time : "1:0", note : "C4", dur : "4n + 8n", prob : 1},
      {time : "1:2", note : "C5", dur : "8n", prob : 0.6},
      {time : "1:2 + 4t", note : "C5", dur : "8n", prob : 0.4},
      {time : "1:2 + 4t*2", note : "Eb5", dur : "8n", prob : 0.9},
      {time : "2:0", note : "F5", dur : "4n + 8n", prob : 1},
      {time : "2:2", note : "F5", dur : "8n", prob : 0.6},
      {time : "2:2 + 4t", note : "F4", dur : "8n", prob : 0.4},
      {time : "2:2 + 4t*2", note : "F5", dur : "8n", prob : 0.9},
      {time : "3:0", note : "F5", dur : "4n + 8n", prob : 1},
      {time : "3:2", note : "F4", dur : "8n", prob : 0.6},
      {time : "3:2 + 4t", note : "F5", dur : "8n", prob : 0.4},
      {time : "3:2 + 4t*2", note : "Bb4", dur : "8n", prob : 0.9}
    ])

dingPart.loop = true;
dingPart.loopEnd = "2m";

  var bell = new Tone.MetalSynth({
			"harmonicity" : 7,
			"resonance" : 400,
			"modulationIndex" : 10,
			"envelope" : {
				"decay" : 0.4,
			},
			"volume" : -24
		}).chain(drumCompress)

var bellPart = new Tone.Part(function(time, event){
  if (Math.random() < event.prob){
    bell.frequency.setValueAtTime(event.note, time, Math.random()*0.3 + 0.3);
    bell.triggerAttack(time);
  }
}, [
  {time : "0:0", note : 150, dur : "8t", prob: 1},
  {time : "0:0 + 8t", note : 100, dur : "8t", prob : 0.6},
  {time : "0:0 + 8n + 16t", note : 200, dur : "16t", prob : 0.75},
  {time : "0:0 + 8n + 8t", note : 175, dur : "8t", prob : 0.75},
  {time : "0:1 + 8n + 16t", note : 200, dur : "8t", prob : 0.9},
  {time : "0:1 + 16t", note : 133, dur : "8t", prob : 1},
  {time : "0:1 + 8n + 8t", note : 200, dur : "16t", prob : 0.75}
  ])

bellPart.loop = true;
bellPart.loopEnd = "2n"

Tone.Transport.bpm.value = 72;

Tone.Transport.start("+0.1")

function start() {
  Tone.Transport.bpm.value = 72;
  membranePart.start('1m')
  dingPart.start('2m')
  bellPart.start('5m')
  Tone.Transport.start("+0.1")
}

function stop() {
  console.log('stopping!');
  bellPart.stop(0)
  dingPart.stop('1m')
  membranePart.stop('2m')
}

module.exports = {
  start,
  stop
}