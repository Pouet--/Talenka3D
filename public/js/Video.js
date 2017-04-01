var Video = function(pos)
{
	// Screen is a plane
	var screen = BABYLON.Mesh.CreatePlane("videoScreen", 120, _scene);
	screen.scaling.y = 0.6;
	screen.position = pos.clone();

	// Material : start with a classic texture, then videoTexture on click
	var screenMaterial = new BABYLON.StandardMaterial("videoScreenMaterial", _scene);
	screenMaterial.diffuseTexture = new BABYLON.Texture("textures/video.png", _scene);
	screenMaterial.backFaceCulling = false;
	screenMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);		// lighting does not work with our directional light, so emissive for the screen effect ;p
	screen.material = screenMaterial;
	
	// Methods
	var hasVideo = function() {
		return screenMaterial.diffuseTexture.video !== undefined;
	}

	var getVideo = function() {
		return screenMaterial.diffuseTexture.video;
	}

	var play = function() {
		if(hasVideo()) {
			screenMaterial.diffuseTexture.video.play();
		}
	}

	var pause = function() {
		if(hasVideo()) {
			screenMaterial.diffuseTexture.video.pause();
		}
	}

	var load = function(id)
	{
		// Pause the previous one if any
		pause();
		// Set the new one
		screenMaterial.diffuseTexture.dispose();
		screenMaterial.diffuseTexture = new BABYLON.VideoTexture("video", ["bande_annonce_DVD_talenka.mov"], _scene, true, false);
		screenMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
		screenMaterial.backFaceCulling = false;
		screenMaterial.diffuseTexture.video.loop = false;
	}

	var resume = function() {
		if(hasVideo()) {
			var vid = getVideo();
			vid.paused ? vid.play() : vid.pause();
		} else {
			console.log('no video element to launch/resume');
		}
	}

	// Actions
	screen.actionManager = new BABYLON.ActionManager(_scene);
	screen.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, resume));
}