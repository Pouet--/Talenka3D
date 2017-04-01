/***********************/
/***** GLOBAL VARS *****/
/***********************/
// SOCKET.IO
var _socket;
// BabylonJS scene
var _canvas,
    _engine,
    _scene,
    _camera,
    _light,
    _skybox,
    _ground,
    _player;        // your character
// Utils
var _feeder,
    _keys,
    _video;
// Arrays
var _players = [],  // other connected characters
    _topics = [];   // array of all topics in the map

window.addEventListener('DOMContentLoaded', function ()
{
    BABYLON.Engine.ShadersRepository = "";

    _socket = io.connect("http://localhost:8000");
    setSocketHandlers();    // from socket.js file

    _canvas = document.getElementById('gameCanvas');
    /*
    canvas.addEventListener("click", function(evt) {
        canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
        if (canvas.requestPointerLock) {
            canvas.requestPointerLock();
        }
    }, false);
*/
    _engine = new BABYLON.Engine(_canvas, true);
    _scene = new BABYLON.Scene(_engine);

    _feeder = new Feeder();
    _feeder.loadTextures();
    _keys = new Keys();
    
    createScene();	// scene.js contains all scene creation

    var update = function()
    {
        // Update player state. If changed, send it to the server
        if(_player.update()) {
            _socket.emit("movePlayer", { pos: _player.getPosition(), rot: _player.getRotation() });
        }
        // Move camera up
        _camera.target = new BABYLON.Vector3(_player.getPosition().x, _player.getPosition().y + 15, _player.getPosition().z);
    }
    _scene.registerBeforeRender(update);

	// the canvas/window resize event handler
    window.addEventListener('resize', function(){
        _engine.resize();
    });

    // PointerLock
    document.addEventListener("pointerlockchange", pointerLockChange, false);
    document.addEventListener("mspointerlockchange", pointerLockChange, false);
    document.addEventListener("mozpointerlockchange", pointerLockChange, false);
    document.addEventListener("webkitpointerlockchange", pointerLockChange, false);

    // Keyboard
    _scene.actionManager = new BABYLON.ActionManager(_scene);
    _scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, _keys.onKeyUp));
    _scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, _keys.onKeyDown));

    // run the render loop
    _engine.runRenderLoop(function(){
        _scene.render();
    });
});