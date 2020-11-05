//server code -> JS/Node/Express/Socket.io

var express = require('express')
var app = require('express')()
var http = require('http').createServer(app)
var io = require('socket.io')(http)

var numOnline = 0;  //number of clients currently connected to server

//allows the CSS to work properly
app.use(express.static(__dirname + '/'));

//respond to a GET request
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

//event listener for socket connections
io.on('connection', (socket) => {
    console.log("A user has connected with socket ID: " + socket.id + ", there are "  + ++numOnline + " users online"); 
    socket.emit('socket ID', numOnline);
    //console.log(socket.id);

    if(numOnline === 1)
        socket.emit('your turn');   //it is now the other clients turn

    socket.on('disconnect', () => {
        console.log("A user has disconnected: " + --numOnline + " users online");
        socket.broadcast.emit('socket ID', numOnline);
        socket.broadcast.emit('your turn');
    });
});

//handle the instant messaging component
io.on('connection', (socket) => {
    socket.on('sendMessage', (msg) => {
        //console.log("Message: " + msg);
        socket.broadcast.emit('received message', msg);   //send the message through to the opponent
    });
});

//broadcast a selected cell to all other sockets, broadcast win/loss message to opponent
io.on('connection', (socket) => {
    socket.on('cell clicked', (index, identity) => {
        socket.broadcast.emit('opponent', index);   //tell the other client which square to fill in red
        socket.broadcast.emit('your turn');         //it is now the other client's turn
    });
    socket.on('winner', () => {
        socket.broadcast.emit('lose');
        io.emit('end');
        socket.broadcast.emit('your turn');
    });
});

//listen for connections
http.listen(3000, () => {
    console.log("listening on port 3000...")
});