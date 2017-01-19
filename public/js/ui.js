var height = window.innerHeight;
var width = window.innerWidth;
console.log(height);
console.log(width);

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