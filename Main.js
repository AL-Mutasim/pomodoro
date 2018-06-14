var Observable = require('FuseJS/Observable');
var FileSystem = require("FuseJS/FileSystem");
var Storage = require("FuseJS/Storage");
var DataStore = require('DataStore').DataStore;
var config = require('Config').Config;
var type = Observable("Pomodoro");
var PomodoroTime = Observable();
var ShortBreakTime = Observable();
var LongBreakTime = Observable();
var PomodoroTimeNFormat = Observable();
var ShortBreakTimeNFormat = Observable();
var LongBreakTimeNFormat = Observable();

var soundFile = Observable();

var startingScreen = Observable(true);
var circleSector = Observable(6.3);
var isRunning = false;
var isStoped = false;


// if (DataStore.isExists || DataStore.read() == '') 
	DataStore.store(JsonData(25,0.1,15));


console.log(DataStore.read());

var data = JSON.parse(DataStore.read());
config.setConfig(data.pomodoro,
				 data.short_Break,
				 data.long_Break )


updateFormatedTomatoData();
updateTomatoData();




function getPomodoro(){
	var jsonData = DataStore.file.getData()
	parseJson(jsonData);
}

function parseJson(text){
	// var s = text.replace()
	var obj = JSON.parse(text);
	console.log(obj.pomodoro);
	// var se = text.trim().replace(/\\/g,"");
	// console.log(se.pomodoro)
	// var p = JSON.parse(json).settings[0].pomodoro;
	// var s = JSON.parse(json).settings[0].short_break;
	// var l = JSON.parse(json).settings[0].long_break;
	// return {
	// 	Pomodoro:p,
	// 	ShortBreakTime:s,
	// 	LongBreakTime:l
	// }
}

	// console.log(DataStore.file.isEmpty);



function JsonData(p, s, l){
	var data = {
		pomodoro:p,
		short_Break:s,
		long_Break:l
	}
	 return JSON.stringify(data);
}


function NanoSecondToMinutesFormat(ns) {
	var minutes = (ns / 60) >> 0;
	var seconds = ns - minutes * 60;
	return minutes + ':' + (('' + seconds).length > 1 ? '' : '0') + seconds;
}

function minutesToNanoSecond(minutes, seconds) {
	return minutes * 60 * 1000 + seconds * 1000;
}

function formatedTimeInScreen(time) {
	return time + ':00'
}


var interval = {
	intervals: [],
	make: function (fun, delay) {
		var newInterval = setInterval(fun, delay);
		this.intervals[newInterval] = true;
		return newInterval;
	},
	clear: function (id) {
		return clearInterval(this.intervals[id]);
	},
	clearAll: function () {
		var all = Object.keys(this.intervals), len = all.length;
		while (len-- > 0)
			clearInterval(all.shift());
	}
};

function showIn(time) {
	switch (type.value) {
		case 'Pomodoro':
			PomodoroTime.value = time;
			break;
		case 'Short Break':
			ShortBreakTime.value = time;
			break;
		case 'Long Break':
			LongBreakTime.value = time;
			break;
		default:
			PomodoroTime.value = time;
			break;
	}
}

var Timer = {
	timeInNs: 0,
	timeToRestTo: 0,
	count: 1,
	isPaused: false,
	sectorBefore:0,
	make: function (time) {
		if (isRunning)
			startingScreen.value = false;
		var start = Date.now();

		this.timeToRestTo = time;
		
		if (isRunning)
			interval.make(function () {
				var timeNow = Date.now();
				var difference = timeNow - start;
				var ns = (((time - difference) / 1000) >> 0);
				var timeFormat = NanoSecondToMinutesFormat(ns);
				Timer.timeInNs = ns;
				
				Timer.count = time;
				var timeInSeconds = ( time/ 1000);
				var downUpTimer = timeInSeconds - ns;

				var sector = 1 / (timeInSeconds - 0) * 6.3
				
				if(!Timer.isPaused)
				Timer.sectorBefore += sector;
				
				circleSector.value = Timer.sectorBefore;
				//  console.log(downUpTimer);
				showIn(timeFormat);
				if (difference > time)
					Timer.stop();

			}, 1000)
	},


	stop: function () {
		Timer.sectorBefore = 0;
		startingScreen.value = true;
		isStoped = true;
		interval.clearAll();
		updateFormatedTomatoData();


/*			*******************************************************************************************
			When the timer stopped i want to run sound.
			I tried in ux but it dose't work
*/
	
		soundFile.value="Sounds/alarmclock.mp3";	
		PlaySoundEvent.raise();		

	},

	pause: function () {
		this.isPaused = true;
		time = this.timeInNs;
		interval.clearAll();

	},
	resume: function () {
		this.isPaused = false;
		interval.clearAll();
		Timer.make(this.timeInNs * 1000);
	},
	reset: function () {
		Timer.sectorBefore = 0;
		interval.clearAll();
		Timer.make(getTimerNow());
	}
}


function updateFormatedTomatoData() {
	PomodoroTime.value = formatedTimeInScreen(config.getPomodoroTime());
	ShortBreakTime.value = formatedTimeInScreen(config.getShortBreakTime());
	LongBreakTime.value = formatedTimeInScreen(config.getLongBreakTime());
}

function updateTomatoData(){
	PomodoroTimeNFormat.value = config.getPomodoroTime();
	ShortBreakTimeNFormat.value = config.getShortBreakTime();
	LongBreakTimeNFormat.value = config.getLongBreakTime();
}



function getTimerNow () {
	isRunning = true;
	switch (type.value) {
		case 'Pomodoro':
			 return minutesToNanoSecond(config.getPomodoroTime(), 0);
			break;
		case 'Short Break':
			return minutesToNanoSecond(config.getShortBreakTime(), 0);
			break;
		case 'Long Break':
			return minutesToNanoSecond(config.getLongBreakTime(), 0);
			break;
	}
}


function StartTimer() {
	Timer.make(getTimerNow());
	
}
function StopTimer() {
	Timer.stop();
}
function PauseTiemr() {
	Timer.pause();
}
function ResumeTimer() {
	Timer.resume();
}

function ResetTimer() {
	Timer.reset();
}

function goToSettingsPage () {
	router.goto("settings");
	
}

function goToMainPage () {
	router.goto("main");
	updateTomatoData();
	
}

function submitNewSettings(){
	DataStore.store(JsonData(PomodoroTimeNFormat.value,
								 ShortBreakTimeNFormat.value,
								 LongBreakTimeNFormat.value));
	config.setConfig(PomodoroTimeNFormat.value,
					  ShortBreakTimeNFormat.value,
		  			  LongBreakTimeNFormat.value )
	updateTomatoData();
	updateFormatedTomatoData();
		router.goto("main");

}



module.exports = {
	soundFile,
	PomodoroTime: PomodoroTime,
	ShortBreakTime: ShortBreakTime,
	LongBreakTime: LongBreakTime,

	PomodoroTimeNFormat:PomodoroTimeNFormat,
	ShortBreakTimeNFormat:ShortBreakTimeNFormat,
	LongBreakTimeNFormat:LongBreakTimeNFormat,

	StartTimer: StartTimer,
	StopTimer: StopTimer,
	PauseTiemr: PauseTiemr,
	ResumeTimer: ResumeTimer,
	ResetTimer: ResetTimer,

	type: type,
	startingScreen: startingScreen,
	circleSector: circleSector,
	
	goToSettingsPage:goToSettingsPage,
	goToMainPage:goToMainPage,


	submitNewSettings:submitNewSettings,

	isStoped:isStoped
}
