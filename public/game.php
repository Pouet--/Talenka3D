<?php
	session_start();
	ini_set('display_errors', 1);

	if(!isset($_SESSION['id']))
		header('Location: index.php');
?>

<!DOCTYPE html>

<html lang="fr">

	<head>
		<title>Talenka 3D</title>
		<meta charset="utf-8">
		
		<!-- INCLUDES -->		
		<!--<link rel="stylesheet" href="../../lib/Bootstrap/bootstrap-3.3.6-dist/css/bootstrap.min.css">-->
		<link rel="stylesheet" href="style/game.css">									<!-- CSS -->
		<script src="http://localhost:8000/socket.io/socket.io.js"></script>			<!-- SocketIO for multiplayer -->
		<script src="../lib/BabylonJS/dist/babylon.2.5.max.js"></script>				<!-- BabylonJS -->
		<script src="../lib/BabylonJS/dist/babylon.2.5.canvas2d.max.js"></script>	<!-- Canvas2D -->
		<script src="../lib/jQuery/jquery-3.2.0.min.js"></script>					<!-- jQuery -->
		<script src="js/dbCallbacks.js"></script>
		<script src="js/Feeder.js"></script>
		<script src="js/functions.js"></script>
		<script src="js/Keys.js"></script>
		<script src="js/Player.js"></script>
		<script src="js/scene.js"></script>
		<script src="js/socket.js"></script>
		<script src="js/Topic.js"></script>
		<script src="js/Video.js"></script>
		<!--<script src="js/shaders/ground/groundMaterial.js"></script>-->
		<script src="shaders/castor/GroundMaterial.js"></script>
	</head>
	
	<body>
		
		<!-- CANVAS -->
		<canvas id="gameCanvas"></canvas>

		<!-- jQuery -->
		<!--<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>-->

		<!-- GLOBAL VARS -->
		<?php
		// Basic info
		echo '<script>var _id = '.$_SESSION['id'].', _login = "'.$_SESSION['login'].'", _playerModel = "'.$_SESSION['player'].'", _startPos = "'.$_SESSION['startPos'].'";</script>';
		
		// If db connection is OK
		/*
		if($res[0] == '')
		{
			// Items
			//select('item_id, qty', 'users_items', 'user_id = '+$_SESSION['id']);
			//echo '<script>var _items = '.json_encode($res).';</script>';
		}
		*/
		?>

		<!-- Entry point ! -->
		<script src="js/main.js"></script>

	</body>
</html>