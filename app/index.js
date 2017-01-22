const Tone = require('tone')
// const EventEmitter = require('./event-emitter')

const canvas = document.getElementById('paperCanvas');
paper.setup(canvas);
paper.install(window);

// const drums = require('./basic-beat')

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


// The amount of circles we want to make:
var count = 100;

// Space Circle Path:
var circlePath = new Path.Circle({
	center: [0, 0],
	radius: 10,
	fillColor: 'white',
	strokeColor: 'white',
	shadowColor: 'cyan',
	shadowBlur: 10,
	shadowOffset: [(Math.floor(Math.random() * 4) - 2), (Math.floor(Math.random() * 4) - 2)]
});

var symbol = new Symbol(circlePath);

// Place the instances of the symbol:
for (var i = 0; i < count; i++) {
	// The center position is a random point in the view:
  var center = new Point((Math.random() * view.size.width), Math.random() * view.size.height);
	var placedSymbol = symbol.place(center);
	// symbol.fillColor.hue += (Math.random() * 8)
	placedSymbol.scale(i / count);
	placedSymbol.direction = 2 * Math.PI * Math.random()
}

// The onFrame function is called up to 60 times a second:
view.onFrame = (event) => {
	// Run through the active layer's children list and change
	// the position of the placed symbols:
	for (var i = 0; i < count; i++) {
		var item = project.activeLayer.children[i];

		// Move the item 1/20th of its width. This way
		// larger circles move faster than smaller circles:
		var speed = item.bounds.width / 30;
		item.position.x += Math.cos(item.direction) * speed;
		item.position.y += Math.sin(item.direction) * speed;

		// If the item has the view, move it back
		if (item.bounds.left > view.size.width) {
			item.position.x = item.bounds.width;
		}
		if (item.bounds.right < 0) {
			item.position.x = view.size.width
		}
		if (item.bounds.bottom < 0) {
			item.position.y = view.size.height
		}
		if (item.bounds.top > view.size.height) {
			item.position.y = 0
		}
	}
}

var tool = new Tool()
tool.minDistance = 1;
tool.maxDistance = 45;

var paths = {}

tool.onMouseDown = (event) => {
	var outEvent = {
		id: socket.id,
		x: event.point.x,
		y: event.point.y,
	}
  socket.emit('mouseDown', outEvent);
}

// create drawing paths
socket.on('mouseDown', function(event) {
	// console.log(event);
  var shadow = new Path();
	var path = new Path();
	path.fillColor = {
		hue: Math.random() * 360,
		saturation: 1,
		brightness: 1,
	};
  shadow.fillColor = {
		hue: path.fillColor.hue,
		saturation: 0.5,
		brightness: 0.8,
	};
	path.add(new Point(event.x, event.y));
  shadow.add(new Point(event.x, event.y));
	if (!paths[event.id]) {
		paths[event.id] = {
			past: []
		}
	}
  paths[event.id].currentPath = {
    path: path,
    shadow: shadow
  };
})

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

socket.on('mouseDrag', function(event) {
	var middlePoint = new Point(event.middlePoint[1], event.middlePoint[2])
	var step = new Point(event.delta[1] / 2, event.delta[2] / 2)
	step.angle += 90;

  // add new paths
  var top = new Point(middlePoint.x + step.x, middlePoint.y + step.y)
	var bottom = new Point(middlePoint.x - step.x, middlePoint.y - step.y)

  // shadow paths
  var shadowTop = new Point(middlePoint.x + (step.x * 1.5), middlePoint.y + (step.y * 2))
	var shadowBottom = new Point(middlePoint.x - (step.x * 1.5), middlePoint.y - (step.y * 2))

	var currentPath = paths[event.id].currentPath;
	currentPath.path.add(top);
	currentPath.path.insert(0, bottom);
	currentPath.path.smooth();

  currentPath.shadow.add(shadowTop);
  currentPath.shadow.insert(0, shadowBottom);
  currentPath.shadow.smooth();

})

tool.onMouseUp =(event) => {
	var outEvent = {
		id: socket.id,
		x: event.point.x,
		y: event.point.y,
	}

  socket.emit('mouseUp', outEvent)
}

socket.on('mouseUp', function(event) {
	var current = paths[event.id].currentPath.path;
  var shadow = paths[event.id].currentPath.shadow;
	current.add(new Point(event.x, event.y));
  shadow.add(new Point(event.x, event.y));

	current.closed = true;
	shadow.closed = true;

  current.smooth();
  shadow.smooth();

	paths[event.id].past.push(current)
  paths[event.id].past.push(shadow)

	timedRemove(current, event.id)
  timedRemove(shadow, event.id)
	delete paths[event.id].currentPath
})


var timedRemove = function(pathToRemove, id) {
	var alpha = 1.0
	var fadeOut = window.setInterval(function() {
		if (alpha === 0) {
			window.clearInterval(fadeOut)
			pathToRemove.remove()
			paths[id].past.unshift()
		} else {
			pathToRemove.fillColor.alpha -= 0.05
		}
	}, 50)
}

