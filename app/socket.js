var socket = io(window.location.origin)

// put the socket on global scope (required for paperscript file to access and emit events)
// window.socket = socket

module.exports = socket