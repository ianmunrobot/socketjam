const socket = require('../socket')
const paths = require('./index')

module.exports = function() {
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


	// create drawing events
	socket.on('serverDown', function(event) {
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

	socket.on('serverDrag', function(event) {
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

	socket.on('serverUp', function(event) {
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
				alpha -= 0.05
			}
		}, 50)
	}

}