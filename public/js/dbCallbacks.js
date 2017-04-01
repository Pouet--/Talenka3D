/**************************************************
** TOPIC
**************************************************/
var callbackTopicsLoad= function(res)
{
	try{
		var obj = JSON.parse(res);
	}catch (e) {
		console.log('error parsing JSON object in callbackTopicsLoad');
		console.log(res);
	}

	if(obj[0] == '')
	{
		console.log('MYSQL -- SELECT all topics OK');
	}else{
		console.log('MYSQL -- SELECT all topics error : '+obj[0]);
	}
	
	// Start at 1 (2nd object) because the first is a string containing errors
	for(var i=1; i<obj.length; i++)
	{
		// Create Topic object
		_topics.push(new Topic(obj[i]));
	}
}
/*
var callback_insert_topic = function(res, postMsg)
{
	try{
		var obj = JSON.parse(res);
	}catch (e) {
		console.log('error parsing JSON object in callback_insert_topic');
		console.log(res);
	}

	if(obj[0] == '')
	{
		console.log('MYSQL -- INSERT topic OK');
	}else{
		console.log('MYSQL -- INSERT topic error : '+obj[0]);
	}

	// Insert post into db
	// TODO : topic_id : get inserted topic id from res object
	var topic_id = 1;
	//console.log('topic_id inserted : '+$obj[1]);
	//var topic_id = $obj[1];
	$.ajax(
	{
		url : 'php/db_queries.php',
		type : 'POST',
		data : { action: "insert_post", user_id: 1, topic_id: topic_id, msg: postMsg },
		dataType : 'text',
		success : function(_res, status){
			callback_insert_post(_res, topic_id);
		},
		error : function(_res, status){
			console.log('return error while inserting a first post in a topic in database');
		}
	});
}
*/
/**************************************************
** POST
**************************************************/
var callbackGetPosts = function(res)
{
	var obj = JSON.parse(res);
	if(typeof(obj[1]) != 'undefined')
	{
		var topic = getTopicById(obj[1]['topic_id']);
		topic.clearPosts();
	
		// Start at 1 (2nd object) because the first is a string containing encountered errors
		for(var i=1; i<obj.length; i++) {
			// Add post in corresponding topic
			topic.addPost(obj[i]);
		}
		topic.displayNewPosts();	// topic are loaded : display it from the first new post
	} else {
		console.log('Empty topic, no posts to display');
	}
}

var callback_insert_post = function(res)
{
	var obj = JSON.parse(res);
	
	// Sprite animation : success or fail
	if(obj[0] == "")
	{
		// Success
		console.log('successful post insert !!');
		/*
		var success = new CASTORGUI.GUITexture("success", "textures/buttons/tick.png",
											{w: 128, h: 128, x: canvas.width * 5/6, y: 64},
											guiManager, function() {
			success.dispose();
		});
		*/
	}
	else
	{
		// Fail
		console.log('error when inserting post : '+obj[0]);
		/*
		var fail = new CASTORGUI.GUITexture("fail", "textures/buttons/wrong.png",
											{w: 128, h: 128, x: canvas.width * 5/6, y: 64},
											guiManager, function() {
			fail.dispose();
		});
		*/
	}

	// Refresh topic to see the new post
	TOPICS[obj[1]].displayNewPosts();
}


/**************************************************
** BUGS
**************************************************/
/*
var callback_insert_bug = function(res)
{
	var obj = JSON.parse(res);
	
	if(obj[0] == "")
		console.log('successful bug insert !!');
	else
		console.log('error when inserting bug in db (haha) : '+obj[0]);
}
*/

/**************************************************
** CHAT
**************************************************/
/*
var callback_insert_chat = function(res)
{
	var obj = JSON.parse(res);
	
	//console.log('insert query : '+obj[1]);
	
	if(obj[0] == "")
		console.log('successful chat insert !!');
	else
		console.log('error when inserting chat msg : '+obj[0]);
}
*/