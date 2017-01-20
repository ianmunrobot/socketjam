// var socket = io(window.location.origin)

// window sizing
var myCanvas = document.getElementById('paperCanvas')
var height = myCanvas.height;
var width = myCanvas.width;


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

tool.minDistance = 10;
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
  socket.emit('mouseUp')
}