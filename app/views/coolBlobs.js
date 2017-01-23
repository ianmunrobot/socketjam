const socket = require('../socket')
const paths = require('./index')

module.exports = function() {

  var count = 20
  var radiusSize = 100;
  var shadowBlur = 100;

  var path1 = new Path.Circle({
    center: [-150, 200],
    radius: radiusSize,
    fillColor: 'white',
    alpha: 0,
    shadowColor: '#00fca4',
    shadowBlur: 100,
    shadowOffset: [view.size.width, 0]
  });

  var path2 = new Path.Circle({
    center: [-150, 200],
    radius: radiusSize,
    fillColor: 'white',
    alpha: 0,
    shadowColor: '#00acfc',
    shadowBlur: 100,
    shadowOffset: [view.size.width, 0]
  });

  var path3 = new Path.Circle({
    center: [-150, 200],
    radius: radiusSize,
    fillColor: 'white',
    alpha: 0,
    shadowColor: '#00e003',
    shadowBlur: 100,
    shadowOffset: [view.size.width, 0]
  });

  var path4 = new Path.Circle({
    center: [-150, 200],
    radius: radiusSize,
    fillColor: 'white',
    shadowColor: '#0011ff',
    shadowBlur: 100,
    shadowOffset: [view.size.width, 0]
  });

  // path1.blendMode = 'darken';
  // path2.blendMode = 'darken';
  // path3.blendMode = 'darken';
  // path4.blendMode = 'darken';

  var symbol1 = new Symbol(path1)
  var symbol2 = new Symbol(path2)
  var symbol3 = new Symbol(path3)
  var symbol4 = new Symbol(path4)

  var symbols = [symbol1, symbol2, symbol3, symbol4]

  for (var i = 0; i < count; i++) {
    // The center position is a random point in the view
    var center = new Point((view.size.width * -1 + view.size.width * ((i % 4) / 4)) + (view.size.width / 8), Math.random() * view.size.height);
    var placedSymbol = symbols[Math.floor(Math.random() * 4)].place(center);
    placedSymbol.speed = Math.random() * 4 - 2;
  }

  view.onFrame = (event) => {
    for (var i = 0; i < count; i++) {
      var item = project.activeLayer.children[i];
      item.position.y = item.position.y + item.speed
      if (item.position.y > view.size.height + 60 || item.position.y < -60) item.speed *= -1
    }
  }

  // Space Circle Path:

  socket.on('serverDown', function(event) {
    var circlePath = new Path.Circle({
      center: [event.x, event.y],
      radius: 20,
      fillColor: 'cyan',
    });
    // create memory queue
    if (!paths[event.id]) {
      paths[event.id] = {
        past: []
      };
    }
    paths[event.id].past.push(circlePath)
    window.setTimeout(function() {
      itemTimeout(circlePath, event.id);
    }, 300);
  })

  socket.on('serverDrag', function(event) {
    var last = paths[event.id].past[paths[event.id].past.length - 1]
    var circlePath = new Path.Circle({
      center: [event.x, event.y],
      radius: 20 + event.delta[1] + event.delta[2],
      fillColor: last.fillColor,
    });
    circlePath.fillColor.hue += Math.floor(Math.random() * 4)
    paths[event.id].past.push(circlePath)
    window.setTimeout(function() {
      itemTimeout(circlePath, event.id)
    }, 300)
  });

  socket.on('serverUp', function() {

  })

  var itemTimeout = function(pathToRemove, id) {
    var alpha = 1.0
    var fadeOut = window.setInterval(function() {
      if (alpha <= 0) {
        pathToRemove.remove()
        paths[id].past.unshift()
        window.clearInterval(fadeOut)
      } else {
        pathToRemove.fillColor.alpha -= 0.1
        alpha -= 0.1
      }
    }, 20)
  }
}