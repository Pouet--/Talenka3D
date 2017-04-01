<?php

include_once('dbSetup.php');

// If connection worked, get user choice
if($res[0] == '')
{
	if(isset($_POST['action']))
	{
		switch($_POST['action'])
		{
			case 'topicsLoad':
				select('*', 'topics');
				break;
				
			case 'select_topic':
				if(isset($_POST['id'])){
					select('*', 'topics', 'id='.$_POST['id']);
				}
				break;

			case 'insert_topic':
				if(isset($_POST['title']) && isset($_POST['user_id']) && isset($_POST['picture']) && isset($_POST['position'])) {
					insert('topics', array('user_id', 'title', 'picture', 'position'),
									 array($_POST['user_id'], $_POST['title'], $_POST['picture'], $_POST['position']));
				}
				
			case 'getPosts':
				if(isset($_POST['topic_id'])){
					select('p.id AS id, topic_id, picture, msg, time',
					'posts p LEFT JOIN users u ON p.user_id = u.id',
					'topic_id='.$_POST['topic_id'],
					'time ASC');
				}
				break;
				
			case 'insert_post':
				if(isset($_POST['topic_id']) && isset($_POST['user_id']) && isset($_POST['msg'])) {
					insert('posts',
							array('topic_id', 'user_id', 'msg'),
							array($_POST['topic_id'], $_POST['user_id'], $_POST['msg']));
					// Memorize topic_id to callback
					$res[1] = $_POST['topic_id'];
				}
				else{
					$res[0] = 'one of mandatory columns is missing when inserting post';
				}
				break;
			
			case 'insert_bug':
				if(isset($_POST['user_id']) && isset($_POST['msg'])){
					insert('bug', array('user_id', 'msg'), array($_POST['user_id'], $_POST['msg']));
				}
				break;

			case 'insert_chat':
				if(isset($_POST['user_id']) && isset($_POST['msg'])){
					insert('chat', array('user_id', 'msg'), array($_POST['user_id'], $_POST['msg']));
				}
				break;
		}
	}
}

// Result of query is stored in $res array
// we send it to ajax callback in JSON format
echo json_encode($res);
?>