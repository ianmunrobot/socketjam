var Tone = require('tone')

var reverb = new Tone.Freeverb(0.7, 2000).toMaster();

var chorus = new Tone.Chorus(0.02, 2.5, 0.5).connect(reverb)
var chorus2 = new Tone.Chorus(0.03, 2.5, 0.5).connect(reverb)
var chorus3 = new Tone.Chorus(0.04, 2.5, 0.5).connect(reverb)

var gain = new Tone.Gain(0.6)

var wanderSynth = new Tone.FMSynth({
			"modulationIndex" : 1,
			"envelope" : {
				"attack" : 1,
				"decay" : 0.2,
				'release': 1
			},
			"modulation" : {
				"type" : "triangle"
			},
			"modulationEnvelope" : {
				"attack" : 0.2,
				"decay" : 0.01
			},
      "volume": -15,
      'portamento': 0.2
    }).chain(chorus);

var wanderSynth2 = new Tone.FMSynth({
  "modulationIndex" : 3.2,
  "envelope" : {
    "attack" : 1,
    "decay" : 0.2,
		'release': 1
  },
  "modulation" : {
    "type" : "triangle"
  },
  "modulationEnvelope" : {
    "attack" : 0.2,
    "decay" : 0.01
  },
  "volume": -18,
  'portamento': 0.2
}).connect(chorus2);

var drone1 = new Tone.FMSynth({
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
    }).chain(gain, chorus3);


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
    }).chain(gain, chorus3);




var scale = ["F3", "G3", "A4", "Bb3", "C3", "D3", "Eb3"]
var scale2 = ["F3", "G3", "A4", "C4", "D4", "Eb4", "F4"]


var wanderSynthSchedule
var wanderSynth2Schedule


function start() {
	drone1.triggerAttack("F2")
	drone2.triggerAttack('C3', "2m")

	wanderSynthSchedule = Tone.Transport.scheduleRepeat(function(time){
  if (Math.random() < 0.07){
    var nextNote = scale[Math.floor(Math.random() * (scale.length - 1))]
    wanderSynth.triggerAttack(nextNote)
  }
}, "8n", "3m");

	wanderSynth2Schedule = Tone.Transport.scheduleRepeat(function(time){
  if (Math.random() < 0.1){
    var nextNote = scale2[Math.floor(Math.random() * (scale2.length - 1))]
    wanderSynth2.triggerAttack(nextNote)
  }
}, "8n", "4m");

	Tone.Transport.bpm.value = 72;
	Tone.Transport.start("+0.1")

}

function stop() {
	drone1.triggerRelease()
	drone2.triggerRelease()
	drone2.frequency.value = 0;
	drone2.triggerRelease('2m')
	wanderSynth.triggerRelease()
	wanderSynth2.triggerRelease()
	Tone.Transport.clear(wanderSynthSchedule)
	Tone.Transport.clear(wanderSynth2Schedule)
}

module.exports = {
	start: start,
	stop: stop
}