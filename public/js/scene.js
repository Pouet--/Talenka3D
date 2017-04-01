var createScene = function()
{
    // Light avec direction comme le soleil pour les ombres
    _light = new BABYLON.DirectionalLight("Sun", new BABYLON.Vector3(-1, -2, -1), _scene);
    _light.id = "sun";
    _light.name = "sun";
    _light.diffuse = new BABYLON.Color3(0.80, 0.80, 0.80);
    _light.specular = BABYLON.Color3.Black();
    _light.intensity = 1.8;
    _light.position = new BABYLON.Vector3(100, 80, 0);

    // Skybox
    _skybox = BABYLON.Mesh.CreateBox("skyBox", 1024, _scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", _scene);
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox/sky/TropicalSunnyDay", _scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);  // Remove light reflection
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0); // on the box
    _skybox.material = skyboxMaterial;
    _skybox.infiniteDistance = true;
    
    // Ground
    _ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "textures/heightMap2048_2.jpg", 1024, 1024, 50, 0, 60, _scene, true, function() {
    //_ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "textures/heightMapCity512.jpg", 400, 400, 50, 0, 60, _scene, true, function() {
        _ground.checkCollisions = true;
        //_ground.receiveShadows = true;
        //_ground.useOctreeForCollisions = true;
        //_ground.subdivide(32);
        //_ground.optimize(32);
        //_ground.setPhysicsState(BABYLON.PhysicsEngine.HeightmapImpostor, {move: !1, mass: 0, friction: 0.4, restitution: 0, num: null});

        // Custom material : Standard + WorldMonger (from CastorEditor)
        var groundMaterial = new WORLDCASTOR.GroundMaterial("groundMaterial", _scene, _light);
        _ground.material = groundMaterial;
    });

    // Player
    var startPos = _startPos.split(',');
    _player = new Player(_playerModel, new BABYLON.Vector3(parseInt(startPos[0]), 30, parseInt(startPos[1])));

    // Camera
    _camera = new BABYLON.ArcRotateCamera("camera", 0, 1, 50, new BABYLON.Vector3(0,0,0), _scene);
    _camera.attachControl(_canvas, true);     // attach the camera to the canvas
    _camera.lowerBetaLimit = 0.1;
    _camera.lowerRadiusLimit = 3;
    _camera.upperRadiusLimit = 150;

    // Video screen
    _video = new Video(new BABYLON.Vector3(30, 40, -50));

    // NPC
    loadNPC();

    // Topics
    loadTopics();
}

var loadNPC = function()
{
    /************/
    /*** Home ***/
    /************/
    // Mesh
    var npcHome = BABYLON.MeshBuilder.CreateBox('npcHome', {size: 10}, _scene);
    npcHome.position = new BABYLON.Vector3(40, 10, -30);
    // Sprite
    var npcHomeSpriteManager = new BABYLON.SpriteManager("npcHomeSpriteManager", "textures/grass.jpg", 1, 512, _scene);
    var npcHomeSprite = new BABYLON.Sprite("npcHomeSprite", npcHomeSpriteManager);
    npcHomeSprite.position = new BABYLON.Vector3(npcHome.position.x, npcHome.position.y + 10, npcHome.position.z);
    npcHomeSprite.size = 0; // disabled by default
    // Actions
    npcHome.actionManager = new BABYLON.ActionManager(_scene);
    npcHome.actionManager.registerAction(new BABYLON.SetValueAction(BABYLON.ActionManager.OnPickTrigger, npcHomeSprite, "size", 5)).then(new BABYLON.SetValueAction(BABYLON.ActionManager.OnPickTrigger, npcHomeSprite, "size", 0));
}

var loadTopics = function()
{
    $.ajax(
    {
        url : 'php/dbQueries.php',
        type : 'POST',
        data : { action: "topicsLoad" },
        dataType : 'text',
        success : function(res, status){
            callbackTopicsLoad(res);
        },
        error : function(res, status){
            console.log('return error while loading all topics');
        }
    });
}