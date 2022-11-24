let skyAspect = 1.77; // Placeholder until we get the network communication going

let skyBoxMargin = 20;

var calculatedSkyBoxWidth;
var calculatedSkyBoxHeight;
var skyBoxUpperLeftCorner;
var validLaunchUpperCorner;
var validLaunchLowerCorner;

var isInClick = false;
var clickStartTime;
var click_x, click_y;
var TIME_TO_MAX_CLICK = 5000;
var MAX_CIRCLE_RADIUS = 100;

var MIN_ANIM_SIZE = 100;
var MAX_ANIM_SIZE = 300;
var ANIM_TIME = 750; // At this time, the firework image is completely offscreen
var activeAnimData = []; // ALWAYS ordered with oldest first. New anims get added to end
var fireworkImg;
// Format: {startTime: float, scale: float [0, 1], xLine: float}

function LaunchScene(){
	this.setup = function(){
		fireworkImg = loadImage('assets/graphics/FireworkBody.png');
	}

	this.show = function(){
		calculatedSkyBoxWidth = width - 2*skyBoxMargin;
		calculatedSkyBoxHeight = calculatedSkyBoxWidth / skyAspect;
		skyBoxUpperLeftCorner = [(width/2) - (calculatedSkyBoxWidth/2), (height/2) - (calculatedSkyBoxHeight/2)];

		if(fwk_selectedType == 0){
			validLaunchUpperCorner = [skyBoxUpperLeftCorner[0], 
																skyBoxUpperLeftCorner[1] + (calculatedSkyBoxHeight/3)*0];
		}else if(fwk_selectedType == 1){
			validLaunchUpperCorner = [skyBoxUpperLeftCorner[0], 
																skyBoxUpperLeftCorner[1] + (calculatedSkyBoxHeight/3)*1];
		}else if(fwk_selectedType == 2){
			validLaunchUpperCorner = [skyBoxUpperLeftCorner[0], 
																skyBoxUpperLeftCorner[1] + (calculatedSkyBoxHeight/3)*2];
		}

		validLaunchLowerCorner = [validLaunchUpperCorner[0] + calculatedSkyBoxWidth,
															validLaunchUpperCorner[1] + calculatedSkyBoxHeight/3];

		isInClick = false;
	}

	this.hide = function(){

	}

	this.draw = function(){
		// print("active anims = " + activeAnimData.length);

		background(0);

		// Page title
		fill(50);
		textFont(font);
		textSize(36);
		textAlign(CENTER, CENTER);
		var title = "";
		if(fwk_selectedType == 0){
			title = "Light";
		}else if(fwk_selectedType == 1){
			title = "Medium";
		}else if(fwk_selectedType == 2){
			title = "Heavy";
		}
		text(title, width/2, height/8);

		// Draw skyBox
		rect(skyBoxUpperLeftCorner[0], skyBoxUpperLeftCorner[1], 
			calculatedSkyBoxWidth, calculatedSkyBoxHeight);
		// Draw valid launch area
		fill(102, 255, 255);
		rect(validLaunchUpperCorner[0], validLaunchUpperCorner[1],
			calculatedSkyBoxWidth, calculatedSkyBoxHeight/3);

		// Draw circle if in click
		if(isInClick){
			var t = (millis() - clickStartTime) / TIME_TO_MAX_CLICK;
			t = constrain(t, 0, 1);
			var circleRadius = MAX_CIRCLE_RADIUS * t;

			fill(255, 255, 102, 190);
			circle(click_x, click_y, circleRadius*2);

			fill(0);
			circle(click_x, click_y, 8);
		}

		// Handle active animations

		// first prune the animation data
		var currentTime = millis();
		while(activeAnimData.length > 0 && millis() >= (activeAnimData[0].startTime + ANIM_TIME)){
			activeAnimData.shift();
			print("LAUNCH ONE!");
			// This is where you would send the network communication
		}

		for(var i = 0; i < activeAnimData.length; i++){
			var t = (millis() - activeAnimData[i].startTime) / ANIM_TIME;
			t = constrain(t, 0, 1);

			var scale = lerp(MIN_ANIM_SIZE, MAX_ANIM_SIZE, activeAnimData[i].scale);
			var top_y = -scale;

			var qY = lerp(height, -scale, t);
			image(fireworkImg, activeAnimData[i].x_line, qY, scale, scale);
		}
	}

	this.mousePressedDelegate = function(){
		if(mouseX > validLaunchUpperCorner[0] && mouseY > validLaunchUpperCorner[1]){
			if(mouseX < validLaunchLowerCorner[0] && mouseY < validLaunchLowerCorner[1]){
				isInClick = true;
				clickStartTime = millis();
				click_x = mouseX;
				click_y = mouseY;
			}
		}
	}

	this.mouseReleasedDelegate = function(){
		if(isInClick){
			// New launch firework animation!
			var t = (millis() - clickStartTime) / TIME_TO_MAX_CLICK;
			t = constrain(t, 0, 1);
			var actualScale = lerp(MIN_ANIM_SIZE, MAX_ANIM_SIZE, t);
			var x = lerp(0, width - actualScale, random());
			var animData = {startTime: millis(), scale: t, x_line: (click_x - actualScale/2)};
			activeAnimData.push(animData);
		}

		isInClick = false;
	}
}