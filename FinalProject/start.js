// start.js 

// global variables
var angleStack = []; // will be used later to plot angle data
var distanceStack = []; // will be used later to plot distance data
var counter = 0; // used for debugging
var degrees = 0; // used for debugging
var globalCounter = 0; // used for debugging

function stepMotor(thisStep){
	
	 // each step is ~1.8 i use this to get 3 reads
	 // per step
	var angleCounter = 0;
	var degInc = 0; // increments the total degrees read

	console.log('This is the counter: ' + globalCounter);
	globalCounter++;	
	switch(thisStep){
		case 0: // 1010
			b.digitalWrite(controller[0], b.HIGH);
			b.digitalWrite(controller[1], b.LOW);
			b.digitalWrite(controller[2], b.HIGH);
			b.digitalWrite(controller[3], b.LOW);
		break;
		case 1: // 0110
			b.digitalWrite(controller[0], b.LOW);
			b.digitalWrite(controller[1], b.HIGH);
			b.digitalWrite(controller[2], b.HIGH);
			b.digitalWrite(controller[3], b.LOW);
		break;
		case 2: // 0101
			b.digitalWrite(controller[0], b.LOW);
			b.digitalWrite(controller[1], b.HIGH);
			b.digitalWrite(controller[2], b.LOW);
			b.digitalWrite(controller[3], b.HIGH);
		break;
		case 3: // 1001
			b.digitalWrite(controller[0], b.HIGH);
			b.digitalWrite(controller[1], b.LOW);
			b.digitalWrite(controller[2], b.LOW);
			b.digitalWrite(controller[3], b.HIGH);
		break;
	}
	
	// clockwise rotatoions	
	if(motorOb.direction == 0)
		degInc = -0.597;
	// counter clockwise rotations
	else if(motorOb.direction == 1)
		degInc = 0.597;
	
	// splits step into 3 reads

	while(angleCounter < 3){

		var current_angle_time = microtime.now();

		if(current_angle_time - motorOb.last_step_angle >= motorOb.step_delay/4){	

			motorOb.last_step_angle = current_angle_time;
			if(motorOb.degree > 360 && motorOb.direction ==1){
				motorOb.degree = 0;
				degInc = 0.597;
			}
			else if((motorOb.degree - 0.010) < 0 && motorOb.direction == 0){
				motorOb.degree = 360;
				degInc = -0.597;
			}
			
			motorOb.degree += degInc;
			console.log('This is the angle: ' + motorOb.degree);

			if(motorOb.direction == 1){
			angleStack.push(motorOb.degree);
			readDistance();	
			}	
		}
		angleCounter++;
	}

	angleCounter = 0;		
}

// sets the delay time to correspond to desired speed
function setSpeed(desiredSpeed, motorOb){
	motorOb.step_delay = 60 * 1000 * 1000 / motorOb.number_of_steps / desiredSpeed;	
}

// increases the actual step

function step(steps_to_move, motorOb){

	var microtime = require('microtime');
	var steps_left = Math.abs(steps_to_move);
	
	if(steps_to_move > 0)
		motorOb.direction = 1;
	else
		motorOb.direction = 0;

	while(steps_left > 0){
		
		var current_step_time = microtime.now();
		
		if(current_step_time - motorOb.last_step_time >= motorOb.step_delay){
			motorOb.last_step_time = current_step_time;
			if(motorOb.direction == 1){
				motorOb.step_number++;
				if(motorOb.step_number == motorOb.number_of_steps)
					motorOb.step_number = 0;
			
			}
			else{
				if(motorOb.step_number == 0)
					motorOb.step_number = motorOb.number_of_steps;
				motorOb.step_number--;
			}
			steps_left--;
			stepMotor(motorOb.step_number % 4);
		}
	}
}

// reads the distance from the lidar by
// measuring the pulses
function readDistance(){

	var b = require('bonescript');
	var micro = require('microtime');

	b.pinMode('P8_19', b.INPUT);
	b.pinMode('P8_17', b.OUTPUT);

	var counter = 0;
	var startTime = 0;
	var endTime = 0;
	var avStart = 0;
	var avEnd = 0;
	var averageArray = [];
	var average = 0;
	var timeout = 0;


	while(1){

		if(b.digitalRead('P8_19')){
			startTime = micro.now();

			while(b.digitalRead('P8_19')){}

			endTime = micro.now();

			if((endTime - startTime) > 40000)
				break;

			averageArray[counter] = endTime - startTime;
			counter++;
			if(counter == 5){

				for(var i = 0; i < 5; i++)
					average += averageArray[i];
				average /= 5;

				distanceStack.push((endTime - startTime)/10);
				//console.log((endTime - startTime));
				break;
			}
		}
	}
}
// plots data using plotly
// takes in the distance and angle array that
// was declared globally

function plotData(distance, angle){
	var plotly = require('plotly')('clintonbess', 'lhk2li7zd2');


	var trace1 = {
	  r: [],
	  t: [],
	  mode: 'lines',
	  name: 'Figure8',
	  marker: {
	    color: 'none',
	    line: {color: 'peru'}
	  },
	  type: 'scatter'
	};

	for(var i = 0; i < distance.length; i++){
		trace1.r[i] = distance[i];
		trace1.t[i] = angle[i];
	}

	var data = [trace1];
	var layout = {
	  autosize: false,
	  width: 500,
	  height: 500,
	  margin: {
	    l: 0,
	    r: 0,
	    b: 0,
	    t: 65
	  }
	};
	var graphOptions = {layout: layout, filename: "plot1", fileopt: "overwrite"};
	plotly.plot(data, graphOptions, function (err, msg) {
	    console.log(msg);
	});
}


// main function

var b = require('bonescript');
var microtime = require('microtime');
var util = require('util');

var controller = ["P9_11", "P9_13", "P9_15", "P9_17"];
var thisStep = 1;
var steps_per_rev = 200;
var desiredSpeed = 30;
var motorOb = {
	read_iteration: 0,
	direction: 0,
	speed: 0,
	step_delay: 0,
	number_of_steps: 200,
	step_number: 0,
	last_step_angle: 0,
	last_step_time: 0,
	degree: 0,
};

// sets the speed.. measured in rpm
setSpeed(30, motorOb);
// spins counter clockwise for 1 revolution
step(201, motorOb);
// spins clockwise for 1 revolution to untangle wires
step(-201, motorOb);


//console.log('this is the angle stack: ' + angleStack);
//console.log('this is the distance stack: ' + distanceStack);

//plots and uploads the data with plotly
plotData(distanceStack, angleStack);






