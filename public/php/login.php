<?php
	session_start();
	ini_set('display_errors', 1);

	// Inclure fichier DB
	include_once('dbSetup.php');
	// If db connection is OK
	if($res[0] == '')
	{
		// Select player info
		select("id, password, player, startPos", "users", "login = '".$_POST['login']."'");
		if(isset($res[1]))
		{
			// Correct authentification, store info
			if($_POST['password'] == $res[1]['password'])
			{
				$_SESSION['id'] = $res[1]['id'];				// ID
				$_SESSION['login'] = $_POST['login'];			// Login
				$_SESSION['player'] = $res[1]['player'];		// player model
				$_SESSION['startPos'] = $res[1]['startPos'];	// starting point

				// Go to the Game !
				header('Location: ../game.php');
			}
			// Wrong password, go back to home page
			else{
				header('Location: ../index.php?e=1');
			}
		}
		// Wrong user name, go back to home page
		else
		{
			header('Location: ../index.php?e=0');
		}
	}
	else
	{
		echo 'error db ?';
	}
?>