var Tone = require('tone')

var reverb = new Tone.Freeverb(0.7, 2000).toMaster();

var chorus = new Tone.Chorus(0.02, 2.5, 0.5).connect(reverb)
var chorus2 = new Tone.Chorus(0.03, 2.5, 0.5).connect(reverb)
var chorus3 = new Tone.Chorus(0.04, 2.5, 0.5).connect(reverb)

var piano = new Tone.FMSynth({
			"modulationIndex" : 1,
			"envelope" : {
				"attack" : 1,
				"decay" : 0.2
			},
			"modulation" : {
				"type" : "triangle"
			},
			"modulationEnvelope" : {
				"attack" : 0.2,
				"decay" : 0.01
			},
      "volume": -10,
      'portamento': 0.2
    }).connect(chorus);

var piano2 = new Tone.FMSynth({
  "modulationIndex" : 3.2,
  "envelope" : {
    "attack" : 1,
    "decay" : 0.2
  },
  "modulation" : {
    "type" : "triangle"
  },
  "modulationEnvelope" : {
    "attack" : 0.2,
    "decay" : 0.01
  },
  "volume": -12,
  'portamento': 0.2
}).connect(chorus2);

var drone = new Tone.FMSynth({
			"modulationIndex" : 3,
			"envelope" : {
				"attack" : 4,
				"decay" : 0.2
			},
			"modulation" : {
				"type" : "square"
			},
			"modulationEnvelope" : {
				"attack" : 0.2,
				"decay" : 0.01
			},
    }).connect(chorus3);

drone.triggerAttack("F2")

var drone2 = new Tone.FMSynth({
			"modulationIndex" : 2,
			"envelope" : {
				"attack" : 3,
				"decay" : 0.2
			},
			"modulation" : {
				"type" : "square"
			},
			"modulationEnvelope" : {
				"attack" : 0.2,
				"decay" : 0.01
			}
    }).connect(chorus3);

drone2.triggerAttack('C3', "2m")

		// var pianoPart = new Tone.Part(function(time, chord){

		// 	piano.triggerAttackRelease(chord, "8n", time);
		// }, [["0:0:2", 'C1'], ["0:1", 'D2'], ["0:1:3", 'E2'], ["0:2:2", "D2"], ["0:3", 'C2'], ["0:3:2", 'F2']]).start(0);
		// pianoPart.loop = true;
		// pianoPart.loopEnd = "1m";

var scale = ["F3", "G3", "A4", "Bb3", "C3", "D3", "Eb3"]
var scale2 = ["F3", "G3", "A4", "C4", "D4", "Eb4", "F4"]

//play a note every eighth note starting from the first measure
Tone.Transport.scheduleRepeat(function(time){
  if (Math.random() < 0.07){
    var nextNote = scale[Math.floor(Math.random() * (scale.length - 1))]
    piano.triggerAttack(nextNote)
    // piano.triggerRelease(time);
  }
}, "8n", "3m");

Tone.Transport.scheduleRepeat(function(time){
  if (Math.random() < 0.1){
    var nextNote = scale2[Math.floor(Math.random() * (scale2.length - 1))]
    piano2.triggerAttack(nextNote)
    // piano.triggerRelease(time);
  }
}, "8n", "4m");

Tone.Transport.bpm.value = 72;

Tone.Transport.start("+0.1")