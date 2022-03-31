class Scheduler {
    constructor(fn, intervalMinutes=1, debug=false) {
        this.fn = fn
        this.interval = intervalMinutes
        this.debug=debug
    }
    async start() {
        var self = this
        if (this.intervalRef) {
            clearInterval(this.intervalRef)
        }
        if(this.debug){
            self.fn = (function(){console.log('INTERVAL: '+this.interval)})
        }
        this.intervalRef = setInterval(self.fn.bind(self), self.interval * 60 * 1000)

        console.log('Background Updater started')
        this.fn()
    }
    async stop() {
        if (this.intervalRef) {
            clearInterval(this.intervalRef)
        }
    }
}
module.exports = {Scheduler}