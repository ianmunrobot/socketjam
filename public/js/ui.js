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

var path;

function onMouseDown(event) {
	path = new Path();
	path.fillColor = {
		hue: Math.random() * 360,
		saturation: 1,
		brightness: 1
	};

	path.add(event.point);
  socket.emit('mouseDown', [event.point.x, event.point.y]);
}

function onMouseDrag(event) {
	var step = event.delta / 2;
	step.angle += 90;

	var top = event.middlePoint + step;
	var bottom = event.middlePoint - step;

	path.add(top);
	path.insert(0, bottom);
	path.smooth();
  socket.emit('mouseDrag', [event.point.x, (event.point.y)])
}

function onMouseUp(event) {
	path.add(event.point);
	path.closed = true;
	path.smooth();
	var counter = path._segments.length;
	var counter2 = counter / 2
	timedRemove(path)
  socket.emit('mouseUp')
}


var timedRemove = function(pathToRemove) {
	var alpha = 1.0
	var fadeOut = window.setInterval(function() {
		if (alpha === 0) {
			window.clearInterval(fadeOut)
			pathToRemove.remove()
		} else {
			pathToRemove.fillColor.alpha -= 0.05
		}
	}, 50)
}