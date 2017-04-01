/**************************************************
** GAME TOPIC CLASS
**************************************************/
var Topic = function(data)
{
	// VARS from db
	var id = data['id'],
		title = data['title'],
		img = data['picture'];

	// VARS mesh
	var	mesh;

	// VAR Canvas2D
	var	canvas2D,	
		avatars = [],		// array of 2D avatars to display, size NB_POSTS
		msg = [],			// array of 2D messages to display, size NB_POSTS
		topPostIndex = 0,	// index of post to display on top
		NB_POSTS = 3;		// nb of posts displayed on the canvas2D
	
	/************/
	/*** Mesh ***/
	/************/
	// A cube
	mesh = BABYLON.Mesh.CreateBox('topic', 10, _scene);
	var array_pos = data['position'].split(",");
	var pos = new BABYLON.Vector3(parseFloat(array_pos[0]), 10, parseFloat(array_pos[1]));
	mesh.position = pos.clone();
	// Material : topic picture
	var meshMaterial = new BABYLON.StandardMaterial("topicMaterial", _scene);
	mesh.material = meshMaterial;
	meshMaterial.diffuseTexture = new BABYLON.Texture("textures/icons/"+img, _scene);

	/********************
	** METHODS
	*********************/
	var getID = function() {
		return id;
	}

	var createCanvas = function()
	{
		// OnClick --> Display Canvas2D
		console.log('display topic');
		
		/*
		canvas2D = new BABYLON.WorldSpaceCanvas2D(scene, new BABYLON.Size(150, 50), {
        	id: "WorldSpaceCanvas",
        	worldPosition: new BABYLON.Vector3(0, 25, 0),
        	//worldRotation: BABYLON.Quaternion.RotationYawPitchRoll(Math.PI / 4, Math.PI / 4, 0),
        	enableInteraction: true,
        	backgroundFill: "#C0C0C040",
        	backgroundRoundRadius: 3,
        	children: [
	            new BABYLON.Text2D(title, { fontName: "6pt Arial", marginAlignment: "h: center, v: top", fontSuperSample: true })
        	]
    	});
    	//canvas2D.scale = 0.2;
    	*/
    	// WorldSpaceCanvas
		var cW = 120, cH = 50;	// Width & height
		//var cScale = 24; 		// renderScaleFactor
		canvas2D = new BABYLON.WorldSpaceCanvas2D(_scene, new BABYLON.Size(cW, cH), {
		    id: "WorldSpaceCanvas",
		    worldPosition: new BABYLON.Vector3(mesh.position.x, mesh.position.y + 25, mesh.position.z),
		    //worldRotation: BABYLON.Quaternion.RotationYawPitchRoll(-camera.alpha - 90*deg2rad, 0, 0),
		    //renderScaleFactor: cScale,
		    enableInteraction: true,
		    backgroundFill: "#C0C0C040",
		    //backgroundRoundRadius: 80,
		    //children: [
	        //    new BABYLON.Text2D(title, { fontName: "6pt Arial", marginAlignment: "h: center, v: top", fontSuperSample: true })
        	//]
		});
		// Title
		var titleH = cH*0.15;
		var titleGroup = new BABYLON.Rectangle2D({ id: "titleGroup", parent: canvas2D, fill: "#A040A0D0", width: cW, height: titleH, marginAlignment: "h: left, v: top", children: [
			new BABYLON.Text2D(title, { fontName: "8pt Arial", marginAlignment: "h: center, v: top", fontSuperSample: true })
		]});

		//var closeButton = new BABYLON.Sprite2D(PIC['close'], { id: "closeButton", parent: titleGroup, spriteSize: new BABYLON.Size(titleH,titleH), marginAlignment: "h: right, v: center", marginRight: titleH });
		//closeButton.pointerEventObservable.add(function (d, s) { console.log('clic on close !'); close(); }, BABYLON.PrimitivePointerInfo.PointerUp);

		var contentW = cW, contentH = cH*0.85;
		var contentGroup = new BABYLON.Rectangle2D({ id: "contentGroup", parent: canvas2D, fill: "#40C040FF", width: contentW, height: contentH, marginAlignment: "h: left, v: bottom" });
		
		/*******************/
		/* LEFT : messages */
		/*******************/
		var msgW = contentW*0.85, msgH = contentH;
		var msgGroup = new BABYLON.Rectangle2D({ id: "msgGroup", parent: contentGroup, fill: "#F00FFFFF", width: msgW, height: msgH, marginAlignment: "h: left, v: center" });
		
		var lineH = msgH/NB_POSTS;
		for(var i=0; i<NB_POSTS; i++)
		{
			// Line
			var startY = msgH - (i+1)*lineH; // first msg on top
			var line = new BABYLON.Rectangle2D({ id: "line"+i, parent: msgGroup, x: 0, y: startY, width: msgW, height: lineH, padding: "top:5%, left:5%, right:5%, bottom:5%",
												border: "#A040A0D0, #FFFFFFFF", borderThickness: 2, fill: "#FFF000000" });

			// Avatar
			var picH = lineH;	// picture height : 90% of the line
			avatars[i] = new BABYLON.Sprite2D(_feeder.getAvatar('tlk'), { id: "avatar"+i, parent: line, spriteSize: new BABYLON.Size(picH,picH), marginAlignment: "h: left, v: center" });

			// Text
			msg[i] = new BABYLON.Text2D("Chargement du msg ...", { id: "text"+i, parent: line, fontName: "6pt Arial", marginAlignment: "h: left, v: top", marginLeft: picH, fontSuperSample: true });
		}

		/****************/
		/* RIGHT : menu */
		/****************/
		var menuW = contentW*0.15, menuH = contentH;
		var menuGroup = new BABYLON.Rectangle2D({ id: "menuGroup", parent: contentGroup, fill: "#00FFFFFF", width: menuW, height: menuH, marginAlignment: "h: right, v: center" });

		var butW = menuW*0.8;
		var buttonRect = new BABYLON.Rectangle2D( { parent: menuGroup, id: "buttonRect", width: butW, height: butW, x: 0, y: menuH - butW, fill: "#40C040FF", roundRadius: 10, 
        children: 
        [
            new BABYLON.Sprite2D(_feeder.getButton('up'), { id: "prevButton", parent: buttonRect, spriteSize: new BABYLON.Size(butW,butW), marginAlignment: "h: center, v: center" })
        ]});
        
		buttonRect.pointerEventObservable.add(function (d, s) {
    		console.log('clic prev post');
    		displayPrevPost();
		}, BABYLON.PrimitivePointerInfo.PointerUp);
		

		var answerButton = new BABYLON.Sprite2D(_feeder.getButton('ans'), { id: "answerButton", parent: menuGroup, spriteSize: new BABYLON.Size(butW,butW), marginAlignment: "h: left, v: center" });
		
		answerButton.pointerEventObservable.add(function (d, s) {
    		console.log('clic answer');
    		//PANEL['post'].create(id);	// send topic_id to the post
		}, BABYLON.PrimitivePointerInfo.PointerUp);
		

		var nextButton = new BABYLON.Sprite2D(_feeder.getButton('down'), { id: "nextButton", parent: menuGroup, spriteSize: new BABYLON.Size(butW,butW), marginAlignment: "h: left, v: bottom" });
		
		nextButton.pointerEventObservable.add(function (d, s) {
    		console.log('clic next post');
    		displayNextPost();
		}, BABYLON.PrimitivePointerInfo.PointerUp);
		
	}

	// Sent a request to get all posts in this topic
	var loadPosts = function()
	{
		$.ajax(
		{
			url : 'php/dbQueries.php',
			type : 'POST',
			data : { action: "getPosts", topic_id: id },
			dataType : 'text',
			success : function(res, status){
				callbackGetPosts(res);
			},
			error : function(res, status){
				console.log('return error while loading posts for topic '+id);
			}
		});
	}

	var addPost = function(obj) {
		posts.push(obj);
	}

	var getNbPosts = function() {
		return posts.length;
	}

	var clearPosts = function() {
		posts = [];
	}

	var displayPostsFrom = function(id)
	{
		topPostIndex = id;

		for(var i=0; i<NB_POSTS; i++)
		{
			var post = posts[id+i];
			if(post)
			{
				// Store post ID (in authorMaterial for example) <<-- searching for another solution ?
				//authorPlaneMaterial[i].id = posts[i]["id"];
				
				// avatar
				//console.log('AVANT : avatar['+i+'].texture = '+avatar[i].texture);
				avatars[i].texture = _feeder.getAvatar(post['picture'].split('.')[0]);	// split array and get first elem : "boz.png" --> ["boz", "png"] --> "boz"
				//console.log('APRES : avatar['+i+'].texture = '+avatar[i].texture);
				
				// text
				msg[i].text = post['msg'];
				console.log('msg : '+post['msg']);
			}
		}
	}

	// Display posts from the first new one
	var displayNewPosts = function()
	{
		// Get position in the list
		var topID = 0;
		while(topID < posts.length && !posts[topID]['isNew']) {
			topID++;
		}

		// Adjust if we are at the bottom of the list
		var less = 0;
		for(i=1; i<=NB_POSTS; i++) {
			if(!posts[topID+i]) {
				less++;
			}
		}
		topID -= less;

		displayPostsFrom(topID);
	}

	var displayTopPosts = function() {
		displayPostsFrom(0);
	}

	var displayBottomPosts = function() {
		displayPostsFrom(getNbPosts() - NB_POSTS);
	}
	
	var displayPrevPost = function()
	{
		// If there is previous post
		if(posts[topPostIndex - 1])
		{
			console.log("load previous post");
			
			// Dispose last post ressources
			//authorPlaneMaterial[MAX_POSTS - 1].diffuseTexture.dispose();
			
			// Shift the posts
			for(var i=NB_POSTS-1; i>=1; i--)
			{
				// avatar --> use PIC[login]
				//authorPlaneMaterial[i].diffuseTexture = authorPlaneMaterial[i-1].diffuseTexture;
				//hasTextureAlpha(authorPlaneMaterial[i]);
				
				// msg
				msg[i].text = posts[topPostIndex + i-1]['msg'];
			}
			
			// Display previous post
			//authorPlaneMaterial[0].diffuseTexture = new BABYLON.Texture("textures/icons/"+posts[topPostIndex - 1]["picture"], scene);
			//hasTextureAlpha(authorPlaneMaterial[0]);
			msg[0].text = posts[topPostIndex - 1]['msg'];
			
			// Update topPostIndex
			topPostIndex--;
		}
		else
		{
			console.log("NO previous post");
		}
	}
	
	var displayNextPost = function()
	{
		// If there is next post
		if(posts[topPostIndex + NB_POSTS])
		{
			console.log("load next post");
			
			// Dispose first post ressources
			//authorPlaneMaterial[0].diffuseTexture.dispose();
			
			// Shift the posts
			for(var i=0; i<=NB_POSTS-2; i++)
			{
				// avatar --> use PIC[login]
				//authorPlaneMaterial[i].diffuseTexture = authorPlaneMaterial[i+1].diffuseTexture;
				//hasTextureAlpha(authorPlaneMaterial[i]);

				// msg
				msg[i].text = posts[topPostIndex + i+1]['msg'];
			}
			
			// Display next post
			//authorPlaneMaterial[MAX_POSTS-1].diffuseTexture = new BABYLON.Texture("textures/icons/"+posts[topPostIndex + MAX_POSTS]["picture"], scene);
			//hasTextureAlpha(authorPlaneMaterial[MAX_POSTS-1]);
			msg[NB_POSTS-1].text = posts[topPostIndex + NB_POSTS]['msg'];
			
			// Update topPostIndex
			topPostIndex++;
		}
		else
		{
			console.log("NO next post");
		}
	}

	var close = function() {
		canvas2D.dispose();
	}

	/***********************
	** Actions
	************************/
	mesh.actionManager = new BABYLON.ActionManager(_scene);
	// Click on cube : create & close
	mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function(){
		createCanvas();		// create WorldSpaceCanvas2D
		loadPosts();		// get Posts from DB
	})).then(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function(){
		close();			// close topic
	}));
	
	// Define which variables and methods can be accessed
	return {
		getID: getID,

		addPost: addPost,
		clearPosts: clearPosts,

		displayPostsFrom: displayPostsFrom,
		displayNewPosts: displayNewPosts,
		displayPrevPost: displayPrevPost,
		displayNextPost: displayNextPost
	}
};