/**************************************************
** NODE.JS REQUIREMENTS
**************************************************/
var app = require('express')(),
	server = require('http').Server(app),
	util = require("util"),					// Utility resources (logging, object inspection, etc)
	io = require("socket.io")(server),				// Socket.IO
	Player = require("./Player").Player;	// Player class


/**************************************************
** GAME VARIABLES
**************************************************/
var socket,		// Socket controller
	players;	// Array of connected players


/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	// Create an empty array to store players
	players = [];

	// Set up Socket.IO to listen on port 8000
	//socket = io.listen(8000);
	server.listen(8000);

	// Configure routes
	//setRouting();

	// Start listening for events
	setEventHandlers();

	util.log('Server launched !');
};

/**************************************************
** ROUTING
**************************************************/
var setRouting = function() {
	// Root
	/*
	app.get('/', function (req, res) {
  		res.render(__dirname + '/public/');
	});
	*/
};

/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	// Socket.IO
	//socket.sockets.on("connection", onSocketConnection);
	io.on('connection', onSocketConnection);
};

// New socket connection
function onSocketConnection(client) {
	util.log("New player has connected: "+client.id);

	// Listen for client disconnected
	client.on("disconnect", onClientDisconnect);

	// Listen for new player message
	client.on("newPlayer", onNewPlayer);

	// Listen for move player message
	client.on("movePlayer", onMovePlayer);
	
	// Listen for new chat message
	client.on("new_chat_msg", onChatMsg);

	// Listen for new private chat message
	client.on("new_private_chat_msg", onPrivateChatMsg);
};

// Socket client has disconnected
function onClientDisconnect() {
	// The 'this' object refers to the client variable
	// from the onSocketConnection function
	util.log("Player has disconnected: "+this.id);

	var removePlayer = playerById(this.id);

	// Player not found
	if (!removePlayer) {
		util.log("Player not found: "+this.id);
		return;
	};

	// Remove player from players array
	players.splice(players.indexOf(removePlayer), 1);

	// Broadcast removed player to connected socket clients
	this.broadcast.emit("removePlayer", {id: this.id});
};

// New player has joined
function onNewPlayer(data) {
	// The 'this' object refers to the client variable
	// from the onSocketConnection function

	// Create a new player
	var newPlayer = new Player(this.id, data.name, data.x, data.z);
	util.log('new player created : '+this.id+', '+data.name+', '+data.x+', '+data.z);
	// Broadcast new player to connected socket clients
	this.broadcast.emit("newPlayer", newPlayer.getInfo());
	
	// Send existing players to the new player
	for (var i=0; i<players.length; i++) {
		this.emit("newPlayer", players[i].getInfo());
	};

	// Now we can add the player in the list
	players.push(newPlayer);
};

// Player has moved
function onMovePlayer(data) {
	// Find player in array
	var movePlayer = playerById(this.id);

	// Player not found
	if (!movePlayer) {
		util.log("Player not found: "+this.id);
		return;
	};

	// Update player position
	movePlayer.setX(data.pos.x);
	movePlayer.setZ(data.pos.z);

	// Broadcast updated position to connected socket clients
	this.broadcast.emit("movePlayer", {id: this.id,
										pos: data.pos,
										rot: data.rot
										});
};

// New msg in chat
function onChatMsg(data)
{
	// Broadcast new chat msg to connected socket clients
	this.broadcast.emit("new_chat_msg", { msg: data.msg });
};


// New msg in a private chat between 2 players
function onPrivateChatMsg(data)
{
	// Send new msg to corresponding player
	socket.to(data.id).emit("new_private_chat_msg", { player_id: this.id, msg: data.msg });
};


/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].getID() == id)
			return players[i];
	};
	
	return false;
};


/**************************************************
** RUN THE GAME
**************************************************/
init();
