class Config{

    setConfig(pomodoroTime, shortBreakTime, longBreakTime){
        this.pomodoroTime = pomodoroTime;
        this.shortBreakTime = shortBreakTime;
        this.longBreakTime = longBreakTime;
    }
    getPomodoroTime(){
        return this.pomodoroTime;
    }
    getShortBreakTime(){
        return this.shortBreakTime;
    }
    getLongBreakTime(){
        return this.longBreakTime;
    }

}




module.exports = {
    Config:new Config()
}