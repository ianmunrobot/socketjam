/* global socket */

// window sizing
var myCanvas = document.getElementById('paperCanvas')
var height = myCanvas.height;
var width = myCanvas.width;


/* squares

// count of rotating squares
var hCount = height/80;
var wCount = width/80

var squarePath = new Path.Rectangle(new Point(20, 20), new Size(20, 20));
squarePath.fillColor = 'aquamarine';
var squareSymbol = new Symbol(squarePath);

// lets place some squares using symbols, and rotate each instance slightly
var offset = 1;
for (var j = 0; j < hCount; j++) {
  for (var i = 0; i < wCount; i++) {
    var placedSymbol = squareSymbol.place(new Point(20 + (i * 40), 20 + (50 * j)));
    placedSymbol.rotate(i * 10 + offset); // operation on the instance
    offset += 1 + Math.floor(Math.random() * 10)
  }
  offset += 1 + Math.floor(Math.random() * 10)
}

function onFrame(event) {
 // Add 1 degree to the hue
 // of the symbol definition's fillColor:
 squareSymbol.definition.fillColor.hue += .01;
 // rotate
 squareSymbol.definition.rotate(0.3);
}

*/

// The amount of circles we want to make:
var count = 100;

// Create a symbol, which we will use to place instances of later:
var circlePath = new Path.Circle({
	center: [0, 0],
	radius: 10,
	fillColor: 'white',
	strokeColor: 'white'
});

var symbol = new Symbol(circlePath);

// Place the instances of the symbol:
for (var i = 0; i < count; i++) {
	// The center position is a random point in the view:
	var center = Point.random() * view.size;
	var placedSymbol = symbol.place(center);
	// placedSymbol.fillColor.hue += (Math.random() * 8)
	placedSymbol.scale(i / count);
	placedSymbol.direction = 2 * Math.PI * Math.random()
}
console.log(view.size);

// The onFrame function is called up to 60 times a second:
function onFrame(event) {
	// Run through the active layer's children list and change
	// the position of the placed symbols:
	for (var i = 0; i < count; i++) {
		var item = project.activeLayer.children[i];

		// Move the item 1/20th of its width to the right. This way
		// larger circles move faster than smaller circles:
		var speed = item.bounds.width / 30;
		item.position.x += Math.cos(item.direction) * speed;
		item.position.y += Math.sin(item.direction) * speed;

		//item.position.x += item.bounds.width / 20;

		// If the item has left the view on the right, move it back
		// to the left:
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


tool.minDistance = 1;
tool.maxDistance = 45;

var paths = {}

function onMouseDown(event) {

	var outEvent = {
		id: socket.id,
		x: event.point.x,
		y: event.point.y,
		// point: event.point,
	}
  socket.emit('mouseDown', outEvent);
}

socket.on('mouseDown', function(event) {
	// console.log(event);
	var path = new Path();
	path.fillColor = {
		hue: Math.random() * 360,
		saturation: 1,
		brightness: 1
	};
	path.add(new Point(event.x, event.y));
	if (!paths[event.id]) {
		paths[event.id] = {
			past: []
		}
	}
	paths[event.id].currentPath = path;
})

function onMouseDrag(event) {
	// var step = event.delta / 2;
	// step.angle += 90;

	// var top = event.middlePoint + step;
	// var bottom = event.middlePoint - step;

	// path.add(top);
	// path.insert(0, bottom);
	// path.smooth();
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
	var step = new Point(event.delta[1], event.delta[2]) / 2;
	step.angle += 90;

	var top = middlePoint + step;
	var bottom = middlePoint - step;

	var currentPath = paths[event.id].currentPath;

	currentPath.add(top);
	currentPath.insert(0, bottom);
	currentPath.smooth();

})

function onMouseUp(event) {
	var outEvent = {
		id: socket.id,
		x: event.point.x,
		y: event.point.y,
	}

  socket.emit('mouseUp', outEvent)
}

socket.on('mouseUp', function(event) {
	var current = paths[event.id].currentPath;
	current.add(new Point(event.x, event.y));
	current.closed = true;
	current.smooth();
	paths[event.id].past.push(current)
	timedRemove(current, event.id)
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