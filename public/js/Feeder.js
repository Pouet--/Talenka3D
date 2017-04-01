var Feeder = function()
{
	var assetsManager = new BABYLON.AssetsManager(_scene);
	var avatars = [],	// avatars on topics
		buttons = [],	// WorldSpaceCanvas2D buttons 
		icons = [],		// GUI icons
		textures = [];	// textures

	/**************************************************
	** TEXTURES
	**************************************************/
	var loadTextures = function()
	{
		/************
		** Avatars **
		************/
		var tlkTex = assetsManager.addTextureTask("tlkTexTask", "textures/icons/talenka.png", true, false, BABYLON.Texture.NEAREST_SAMPLINGMODE);
	 	var bozTex = assetsManager.addTextureTask("bozTexTask", "textures/icons/boz.png", true, true, BABYLON.Texture.NEAREST_SAMPLINGMODE);
	 	var ddTex = assetsManager.addTextureTask("ddTexTask", "textures/icons/dd.jpg", true, false, BABYLON.Texture.NEAREST_SAMPLINGMODE);
	 	
	 	/************
		** Buttons **
		************/
		// Topic
		var upTex = assetsManager.addTextureTask("upTexTask", "textures/buttons/64/up_gold.png", true, true, BABYLON.Texture.NEAREST_SAMPLINGMODE);
	 	var downTex = assetsManager.addTextureTask("downTexTask", "textures/buttons/64/down_gold.png", true, true, BABYLON.Texture.NEAREST_SAMPLINGMODE);
	 	var ansTex = assetsManager.addTextureTask("ansTexTask", "textures/buttons/64/answer.png", true, false, BABYLON.Texture.NEAREST_SAMPLINGMODE);
	 	var closeTex = assetsManager.addTextureTask("closeTexTask", "textures/buttons/64/close.png", true, false, BABYLON.Texture.NEAREST_SAMPLINGMODE);
	 	
	 	// Canvas
	 	var mailTex = assetsManager.addTextureTask("mailTexTask", "textures/buttons/64/mail.png", true, true, BABYLON.Texture.NEAREST_SAMPLINGMODE);
	 	var musicTex = assetsManager.addTextureTask("musicTexTask", "textures/buttons/64/music.png", true, true, BABYLON.Texture.NEAREST_SAMPLINGMODE);
	 	var quotesTex = assetsManager.addTextureTask("quotesTexTask", "textures/buttons/64/quotes.png", true, true, BABYLON.Texture.NEAREST_SAMPLINGMODE);
	 	
		var caroTex = assetsManager.addTextureTask("texTask", "textures/carreaux.jpg", true, false, BABYLON.Texture.NEAREST_SAMPLINGMODE);
	 	
	 	/*************
		** Textures **
		*************/
	 	var wallTex = assetsManager.addTextureTask("wallTexTask", "textures/wallRepeatBrick.png", true, false);		// Graph wall
	 	
		/**************
		** Callbacks **
		**************/
	 	tlkTex.onSuccess = function(task) { avatars['tlk'] = task.texture; }
	 	bozTex.onSuccess = function(task) { avatars['boz'] = task.texture; }
	 	ddTex.onSuccess = function(task) { avatars['dd'] = task.texture; }
		upTex.onSuccess = function(task) { buttons['up'] = task.texture; }
	 	downTex.onSuccess = function(task) { buttons['down'] = task.texture; }
	 	ansTex.onSuccess = function(task) { buttons['ans'] = task.texture; }
	 	closeTex.onSuccess = function(task) { buttons['close'] = task.texture; }
	 	mailTex.onSuccess = function(task) { icons['mail'] = task.texture; }
	 	musicTex.onSuccess = function(task) { icons['music'] = task.texture; }
	 	quotesTex.onSuccess = function(task) { icons['quotes'] = task.texture; }
	 	caroTex.onSuccess = function(task) { icons['caro'] = task.texture; }
		wallTex.onSuccess = function(task) { textures['wall'] = task.texture; }

		assetsManager.load();
	}

	var getAvatar = function(name) {
		if(avatars[name])
			return avatars[name];
	}
	var getButton = function(name) {
		return buttons[name];
	}
	var getIcon = function(name) {
		return icons[name];
	}
	var getTexture = function(name) {
		return textures[name];
	}

	return {
		loadTextures: loadTextures,
		getAvatar: getAvatar,
		getButton: getButton,
		getIcon: getIcon,
		getTexture: getTexture
	}
}