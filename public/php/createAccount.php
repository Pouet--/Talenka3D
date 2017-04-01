<?php
// Sign up page
if (isset($_POST['inputLogin']))
{
	if($_POST['inputPassword'] != $_POST['inputPasswordV'])
	{
		header('Location: '.$PHP_SELF.'?e=1');
		die();
	}

	include_once('db_functions.php');

	// If connection works, insert new player
	if($res[0] == '')
	{
		insert('users', array('login', 'password'),
						array($_POST['inputLogin'], $_POST['inputPassword']));
		if($res[0] == '')
		{
			header('Location: ../index.php?e=2');
			die();
		}else{
			header('Location: '.$PHP_SELF.'?e=3');
			die();
		}
	}
	else
	{
		header('Location: '.$PHP_SELF.'?e=2');
		die();
	}
}
?>
<!DOCTYPE html>

<html lang="en">

	<head>
		<meta charset="utf-8">
		<title>Talenka3D - Création de joueur</title>

		<link rel="stylesheet" href="../../../bootstrap-3.3.6-dist/css/bootstrap.min.css">
		<link rel="stylesheet" href="../style/createAccount.css">

		<script src="../../../BabylonJS/dist/babylon.2.5.max.js"></script>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
	</head>
	
	<body>
		<!-- Error message if any -->
		<?php
		if(isset($_GET['e']))
		{
			echo '<div class="alert alert-warning" role="alert">';
			switch($_GET['e'])
			{
				case 0:
				break;

				case 1:
					echo 'Les mots de passe ne sont pas identiques';
				break;

				case 2:
					echo 'La connexion à la base de données a échoué';
				break;

				case 3:
					echo 'Echec de l\'insertion du joueur';
				break;

				default:
				break;
			}
			echo '</div>';
		}
		?>

		<!-- FORM -->
    	<form class="form-signin" action="<?php echo $PHP_SELF;?>" enctype="application/x-www-form-urlencoded" method="post">
    		<div class="row">
	    		<div class="col-md-6">
	          		<h2 class="form-signin-heading">Infos personnelles</h2>
	      			<label for="inputLogin" class="sr-only">Pseudo</label>
	    			<input type="text" name="inputLogin" class="form-control" placeholder="Pseudo" required autofocus>
	    			<label for="inputPassword" class="sr-only">Mot de passe</label>
	    			<input type="password" name="inputPassword" class="form-control" placeholder="Mot de passe" required>
	    			<label for="inputPasswordV" class="sr-only">Confirmation du mot de passe</label>
	    			<input type="password" name="inputPasswordV" class="form-control" placeholder="Confirmation du mot de passe" required>
	    		</div>
	    		<div class="col-md-6">
	      			<h2 class="form-signin-heading">Choix du joueur</h2>
	      			<button class="btn btn-lg btn-warning" type="button" onClick="loadMesh('rabbit')">Rabbit</button>
	      			<button class="btn btn-lg btn-info" type="button" onClick="loadMesh('dude');$('player').value='dude'">Dude</button>
	      			<button class="btn btn-lg btn-info" type="button" onClick="loadMesh('miku');$('player').value='miku'">Miku</button>
	      			<button class="btn btn-lg btn-info" type="button" onClick="loadMesh('diva');$('player').value='diva'">Diva</button>
	      			<button class="btn btn-lg btn-info" type="button" onClick="loadMesh('usausa');$('player').value='usausa'">Usausa</button>
	      			<button class="btn btn-lg btn-info" type="button" onClick="loadMesh('bunny');$('player').value='bunny'">Bunny</button>
	      			<button class="btn btn-lg btn-info" type="button" onClick="loadMesh('nightwing');$('player').value='nightwing'">Nightwing</button>	
	      			<button class="btn btn-lg btn-info" type="button" onClick="loadMesh('ninja');$('player').value='ninja'">Ninja</button>
	      		</div>
   			</div>
   			<button class="btn btn-lg btn-primary btn-block" type="submit">Création du bousin !</button>
   			<input type="hidden" name="player" id="player">
    	</form>

    	<!-- CANVAS -->
    	<canvas id="gameCanvas"></canvas>
		<script>var state = "create_account";</script>

		<!-- OWN SCRIPTS -->
		<!--
		<script src="../js/engine.js"></script>
		<script src="../js/utils.js"></script>
		<script src="../js/createAccount/index.js"></script>
		-->
		<script>
        	///// Global variables /////
        	var deg2rad = Math.PI / 180;
        	var player = null;

            // get the canvas DOM element
            var canvas = document.getElementById('gameCanvas');
            canvas.width = window.innerWidth * 1 / 3 - 30;
			canvas.height = window.innerHeight * 4 / 5;
			var x = window.innerWidth * 2 / 3;
			var y = window.innerHeight / 10;
			canvas.style = "position: absolute; left: "+x+"px; top:"+y+"px;";

            // load the 3D engine
            var engine = new BABYLON.Engine(canvas, true);

            // createScene function that creates and return the scene
            var createScene = function(){
                // create a basic BJS Scene object
                var scene = new BABYLON.Scene(engine);

                // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
                camera = new BABYLON.ArcRotateCamera("camera1", 0, 1.2, 10, new BABYLON.Vector3(0, 3, 0), scene);

                // attach the camera to the canvas
                camera.attachControl(canvas, false);

                // create a basic light, aiming 0,1,0 - meaning, to the sky
                var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);

                // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
                var ground = BABYLON.Mesh.CreateGround('ground1', 6, 6, 2, scene);

                // return the created scene
                return scene;
            }

            var loadMesh = function(meshName)
            {
            	if(meshName == 'rabbit')
            	{
					BABYLON.SceneLoader.ImportMesh("", "../models/rabbit/", "rabbit.babylon", scene, function (meshes, particles, skeletons)
						{
							if(player) player.dispose();
							player = meshes[0];
							//player.position = BABYLON.Vector3.Zero();
							player.rotation.y += 90 * deg2rad;
							player.scaling = new BABYLON.Vector3(0.05, 0.05, 0.05);
							scene.beginAnimation(skeletons[0], 0, 100, true, 0.8);
						});
            	}
           		else if(meshName == 'dude')
           		{
           			BABYLON.SceneLoader.ImportMesh("", "../models/dude/", "dude.babylon", scene, function (meshes, particles, skeletons)
						{
							if(player) player.dispose();
							player = meshes[0];
							//player.position = BABYLON.Vector3.Zero();
							player.rotation.y -= 90 * deg2rad;
							player.scaling = new BABYLON.Vector3(0.08, 0.08, 0.08);
							scene.beginAnimation(skeletons[0], 0, 100, true, 1.0);
						});	
           		}
           		else if(meshName == 'miku')
           		{
           			BABYLON.SceneLoader.ImportMesh("", "../models/miku/", "negimiku.babylon", scene, function (meshes)
						{
							if(player) player.dispose();
							// Loop
							var invisibleMesh = BABYLON.Mesh.CreateBox('parentMeshNegimiku', 1, scene);
							invisibleMesh.isVisible = false;
							for (var i=0; i<meshes.length; i++) {
								var m = meshes[i];
								m.parent = invisibleMesh;
							}
							player = invisibleMesh;
							player.position = new BABYLON.Vector3(0, 3, 0);
							player.rotation.y -= 90 * deg2rad;
							player.scaling = new BABYLON.Vector3(20, 20, 20);
							//scene.beginAnimation(skeletons[0], 0, 100, true, 1.0);
						});	
           		}
           		else if(meshName == 'diva')
           		{
           			BABYLON.SceneLoader.ImportMesh("", "../models/miku_diva/", "diva_miku.babylon", scene, function (meshes, particles, skeletons)
						{
							if(player) player.dispose();
							player = meshes[0];
							//player.position = BABYLON.Vector3.Zero();
							player.rotation.x -= 90 * deg2rad;
							player.rotation.y -= 90 * deg2rad;
							player.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
							//scene.beginAnimation(skeletons[0], 0, 100, true, 1.0);
						});	
           		}
           		else if(meshName == 'usausa')
           		{
           			BABYLON.SceneLoader.ImportMesh("", "../models/usausa/", "usausa.babylon", scene, function (meshes, particles, skeletons)
						{
							if(player) player.dispose();
							player = meshes[0];
							//player.position = BABYLON.Vector3.Zero();
							player.rotation.x -= 90 * deg2rad;
							player.rotation.y -= 90 * deg2rad;
							player.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
							scene.beginAnimation(skeletons[0], 0, 100, true, 1.0);
						});	
           		}
           		else if(meshName == 'bunny')
           		{
           			BABYLON.SceneLoader.ImportMesh("", "../models/bunny/", "bunny.babylon", scene, function (meshes, particles, skeletons)
						{
							if(player) player.dispose();
							player = meshes[0];
							//player.position = BABYLON.Vector3.Zero();
							player.rotation.x -= 90 * deg2rad;
							player.rotation.y -= 90 * deg2rad;
							player.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
							//scene.beginAnimation(skeletons[0], 0, 100, true, 1.0);
						});	
           		}
           		else if(meshName == 'nightwing')
           		{
           			BABYLON.SceneLoader.ImportMesh("", "../models/nightwing/", "nightwing.babylon", scene, function (meshes, particles, skeletons)
						{
							if(player) player.dispose();
							player = meshes[0];
							//player.position = BABYLON.Vector3.Zero();
							player.rotation.x -= 90 * deg2rad;
							player.rotation.y -= 90 * deg2rad;
							player.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
							scene.beginAnimation(skeletons[0], 0, 296, true, 1.0);
						});
           		}
           		else if(meshName == 'ninja')
           		{
           			BABYLON.SceneLoader.ImportMesh("", "../models/ninja/", "ninja.babylon", scene, function (meshes, particles, skeletons)
						{
							if(player) player.dispose();
							// Loop
							var invisibleMesh = BABYLON.Mesh.CreateBox('parentMeshNinja', 1, scene);
							invisibleMesh.isVisible = false;
							for (var i=0; i<meshes.length; i++) {
								var m = meshes[i];
								m.parent = invisibleMesh;
							}
							player = invisibleMesh;
							//player.position = new BABYLON.Vector3(0, 3, 0);
							player.rotation.x -= 90 * deg2rad;
							player.rotation.y += 90 * deg2rad;
							player.scaling = new BABYLON.Vector3(0.7, 0.7, 0.7);
							scene.beginAnimation(skeletons[0], 1, 14, true, 1.0);
						});
           		}
           	}

            // call the createScene function
            var scene = createScene();
			//loadMesh('dude');

            // run the render loop
            engine.runRenderLoop(function(){
                scene.render();
            });

            // the canvas/window resize event handler
            window.addEventListener('resize', function(){
                engine.resize();
            });
    	</script>
	</body>
</html>