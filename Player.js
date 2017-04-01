/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(_id, _name, _x, _z)
{
    var id = _id,
        name = _name,
        x = _x,
        z = _z;

    // Getters and setters
    var getID = function() {
        return id;
    }

    var getName = function() {
        return name;
    }

    var getX = function() {
        return x;
    };

    var getZ = function() {
        return z;
    };

    var setX = function(newX) {
        x = newX;
    };

    var setZ = function(newZ) {
        z = newZ;
    };

    var getInfo = function() {
        return { 'id': id, 'name': name, 'x': x, 'z': z };
    }

    // Define which variables and methods can be accessed
    return {
        getID: getID,
        getName: getName,
        getX: getX,
        getZ: getZ,
        setX: setX,
        setZ: setZ,
        getInfo: getInfo
    }
};

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Player = Player;