const Tone = require('tone');

var drumCompress = new Tone.Compressor({
		"threshold" : -12,
		"ratio" : 6,
		"attack" : 0.3,
		"release" : 0.1
	}).toMaster();

var drum1 = new Tone.MembraneSynth({
  "pitchDecay" : 0.016,
  "octaves" : 2,
  "envelope" : {
    "attack" : 0.0006,
    "decay" : 0.5,
    "sustain" : 0
  }
}).chain(drumCompress);


var membranePart = new Tone.Sequence(function(time, pitch){
  drum1.triggerAttack(pitch, time, Math.random()*0.5 + 0.5);
}, ["F2", 'F3', "Eb3", "C3", null, "C3", null, "Eb2"], "8n").start(0);
membranePart.loop = true;
membranePart.loopEnd = "1m";

var drum2 = new Tone.MembraneSynth({
  "pitchDecay" : 0.02,
  "octaves" : 10,
  "envelope" : {
    "attack" : 0.006,
    "decay" : 0.5,
    "sustain" : 0
  },
  "volume": -12
}).chain(drumCompress);


// var membranePart2 = new Tone.Sequence(function(time, pitch){
//   drum2.triggerAttack(pitch, time, Math.random()*0.5 + 0.5);
// }, [null, 'D4', "Eb3", "Gb4", null, "C5", null, "Eb5", 'F5'], "16n").start(0);
// membranePart2.loop = true;
// membranePart2.loopEnd = "2n";


var bell = new Tone.MetalSynth({
			"harmonicity" : 7,
			"resonance" : 400,
			"modulationIndex" : 10,
			"envelope" : {
				"decay" : 0.4,
			},
			"volume" : -18
		}).toMaster();
		var bellPart = new Tone.Sequence(function(time, freq){
			bell.frequency.setValueAtTime(freq, time, Math.random()*0.3 + 0.3);
			bell.triggerAttack(time);
		}, [150, null, 100, null, 200, 175, null, 200, null, 133, null, 200], "16t").start(0);


var bassPart = new Tone.Part(function(time, event){
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
    {time : "3:2 + 4t*2", note : "Bb4", dur : "8n", prob : 0.9}]).start(0);

  bassPart.loop = true;
	bassPart.loopEnd = "2m";

Tone.Transport.bpm.value = 72;

Tone.Transport.start("+0.1")