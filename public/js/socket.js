/************************/
/*** socket functions ***/
/************************/
var setSocketHandlers = function ()
{
    _socket.on("connect", onSocketConnected);
    _socket.on("disconnect", onSocketDisconnect);
    _socket.on("newPlayer", onNewPlayer);
    _socket.on("movePlayer", onMovePlayer);
    _socket.on("removePlayer", onRemovePlayer);
}

var onSocketConnected = function ()
{
    // 'this' refers to socket object
    console.log("Connected to socket server");
    // Send local player data to the game server
    this.emit("newPlayer", { name: "test", x: _player.getPosition().x, z: _player.getPosition().z });
}

var onSocketDisconnect = function ()
{
    // 'this' refers to socket object
    console.log("Disconnected from socket server");
    // Send local player data to the game server
    this.emit("disconnect");
}

var onNewPlayer = function (data)
{
    console.log("New player connected: " + data.id);
    // Initialise the new player ("dude" for everyone else for the moment)
    var newPlayer = new Player("dude", new BABYLON.Vector3(data.x, 10, data.z));
    newPlayer.setID(data.id);
    // Add new player to the remote players array
    _players.push(newPlayer);
}

var onMovePlayer = function(data)
{
    var movePlayer = getPlayerById(data.id);

    // Player not found
    if (!movePlayer) {
        console.log("Player not found: "+data.id);
        return;
    };

    // Update player pos/rot
    movePlayer.setPosition(data.pos);
    movePlayer.setRotation(data.rot);
}

var onRemovePlayer = function (data)
{
    var removePlayer = getPlayerById(data.id);

	// Player not found
	if (!removePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	// Remove player from array
	_players.splice(_players.indexOf(removePlayer), 1);
	console.log("Player disconnected: "+data.id);
	// And from scene
	removePlayer.dispose();
}