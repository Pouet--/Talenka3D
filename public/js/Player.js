/********************/
/*** PLAYER CLASS ***/
/********************/
var Player = function (model, pos)
{
    var deg2rad = Math.PI / 180;
	
    var id;
	var body = BABYLON.MeshBuilder.CreateSphere('sphere1', {segments: 16, diameter: 10}, _scene);
    body.position = pos;
    var speed = 1;

    // Getters / Setters
    var getID = function() {
        return id;
    }
    var setID = function(i) {
        id = i;
    }

    var getBody = function() {
    	return body;
    }

    var getPosition = function() {
        return body.position;
    }
    var setPosition = function(pos) {
        body.position = pos;
    }

    var getRotation = function() {
        return body.rotation;
    }
    var setRotation = function(rot) {
        body.rotation = rot;
    }

    var update = function()
    {
        var prevX = body.position.x;
        var prevZ = body.position.z;

        // Direction we want to go
        var direction;

        if (_keys.isUp())
        {
            if (_keys.isLeft()) direction = 45;
            else if (_keys.isRight()) direction = 315;
            else direction = 0;
        }
        else if (_keys.isDown())
        {
            if (_keys.isLeft()) direction = 135;
            else if (_keys.isRight()) direction = 225;
            else direction = 180;
        }
        else
        {
            if (_keys.isLeft()) direction = 90;
            else if (_keys.isRight()) direction = 270;
            else direction = -1;
        }

        // If there is a direction change
        if(direction >= 0)
        {
            // Modify direction according to camera angle
            direction = direction * deg2rad + _camera.alpha + 90*deg2rad;
            
            // Rotate body
            body.rotation.y = -direction * deg2rad;

            // Compute movement along x and z axis
            var dx = -Math.sin(direction) * speed;
            var dz = Math.cos(direction) * speed;

            body.moveWithCollisions(new BABYLON.Vector3(dx, -0.5, dz));

            return true;
        }
        else
        {
            // ADD THIS TO SIMULATE GRAVITY WHEN MOVEWITHCOLLISIONS
            body.moveWithCollisions(new BABYLON.Vector3(0, -0.5, 0));

            return false;
        }
    }

    var dispose = function()
    {
        body.dispose();
    }

    return {
        getID: getID,
        setID: setID,
    	getBody: getBody,
    	getPosition: getPosition,
        setPosition: setPosition,
        getRotation: getRotation,
        setRotation: setRotation,

        update: update,
        dispose: dispose
    }
};