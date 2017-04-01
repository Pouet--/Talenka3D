// PointerLock
var pointerLockChange = function() {
    controlEnabled = (
                       document.mozPointerLockElement === canvas
                    || document.webkitPointerLockElement === canvas
                    || document.msPointerLockElement === canvas
                    || document.pointerLockElement === canvas);
    // If the user is alreday locked
    if (!controlEnabled) {
        scene.activeCamera.detachControl(canvas);
    } else {
        scene.activeCamera.attachControl(canvas);
    }
}

var getPlayerById = function(id)
{
    var i;
    for (i = 0; i < _players.length; i++) {
        if (_players[i].getID() == id)
            return _players[i];
    };
    
    return false;
};

var getTopicById = function(id)
{
    for(var i=0; i<_topics.length; i++) {
        if(_topics[i].getID() == id) {
            return _topics[i];
        }
    }
    return false;
}