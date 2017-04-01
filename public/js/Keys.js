var KEY_MAP = {
  'TAB': 9,
  'ENTER': 13, 'SHIFT': 16,
  'VERR_MAJ': 20, 'ESC': 27,
  'SPACE': 32,
  'LEFT': 37, 'UP': 38, 'RIGHT': 39, 'DOWN': 40,
  'A': 65, 'B': 66, 'C': 67, 'D': 68, 'E': 69,
  'F': 70, 'G': 71, 'H': 72, 'I': 73, 'J': 74, 'K': 75, 'L': 76, 'M': 77, 'N': 78, 'O': 79,
  'P': 80, 'Q': 81, 'R': 82, 'S': 83, 'T': 84, 'U': 85, 'V': 86, 'W': 87, 'X': 88, 'Y': 89,
  'Z': 90
};


/**************************************************
** GAME KEYBOARD CLASS
**************************************************/
var Keys = function(up, left, right, down)
{
	var up = up || false,
		left = left || false,
		right = right || false,
		down = down || false,
		tab = false;

	var isUp = function() {
		return up;
	}
	var isLeft = function() {
		return left;
	}
	var isRight = function() {
		return right;
	}
	var isDown = function() {
		return down;
	}
	
	var onKeyDown = function(e)
	{
		//var c = e.keyCode;
		var c = e.sourceEvent.key;
		
		switch (c)
		{		
			// Movement
			case 'z': // Up
				up = true;
				break;
			
			case 'q': // Left
				left = true;	 // Will take priority over the right key
				break;
			
			case 's': // Down
				down = true;
				break;
			
			case 'd': // Right
				right = true;
				break;
			
			case 'l':
				// Switch pointerLock ON/OFF
				//switchPointerLock();
				break;
				
			default:
				break;
		}		
	};
	
	var onKeyUp = function(e)
	{
		//var c = e.keyCode;
		var c = e.sourceEvent.key;

		switch (c)
		{
			case 'q': // Left
				left = false;
				break;
			case 'z': // Up
				up = false;
				break;
			case 'd': // Right
				right = false;
				break;
			case 's': // Down
				down = false;
				break;
			default:
				break;
		}
	}

	return {
		isUp: isUp,
		isLeft: isLeft,
		isRight: isRight,
		isDown: isDown,

		onKeyDown: onKeyDown,
		onKeyUp: onKeyUp
	}
};