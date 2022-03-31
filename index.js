const { Telegraf } = require('telegraf')
const { stats } = require('./flexpool')
const {Scheduler} = require('./scheduler')

const {
    botToken, 
    wallet, 
    coin, 
    intervalMinutes,
    debug
} = require('./config.json')

let scheduler
let bot
let chatId
const main = () => {
    try{
        // Bot setup
        bot = new Telegraf(botToken)

        // Scheduler setup
        scheduler = new Scheduler(async ()=>{
            try{
                const {averageEffectiveHashrate,
                    currentEffectiveHashrate,
                    invalidShares,
                    reportedHashrate,
                    staleShares,
                    validShares} = await stats({wallet, coin})
                if(bot && chatId){
                    bot.telegram.sendMessage(
                        chatId, 
                        `Your average effective hash rate is: ${averageEffectiveHashrate}
                        Your current effective hashrate is: ${currentEffectiveHashrate}
                        Your reported hashrate is: ${reportedHashrate}.
                        Found ${validShares} valid shares, ${invalidShares} invalids and ${staleShares} stale`
                    )
                }
            }catch(ex){
                console.error('Error while retrieving wallet stats')
                console.error(ex)
            }
        },intervalMinutes, debug)

        scheduler.start()

        bot.start(async (ctx) => {

            let user = ctx.chat.username
            chatId = ctx.chat.id
            if(scheduler) {
                scheduler.start()
            }
            ctx.reply(`Welcome, ${user}. Your bot started`)    
        })

        
        bot.command('report', async (ctx) => {
            const latest = await db.extractLatestData()
            ctx.reply(latest)
        })

        bot.launch()  
        console.log('Bot is running...')


    }catch(ex){
        if (bot && chatId) {
            bot.telegram.sendMessage(chatId, 'A fatal error occurred while running the bot. Pleaase restart it manually')
        }
        console.error('An error occurred')
        console.log(ex)
    }
}
main();


// Enable graceful stop
process.once('SIGINT', () => {
    bot.stop('SIGINT')
    if(scheduler) {scheduler.stop()}
    if (broadcaster) { broadcaster.stop() }
})
process.once('SIGTERM', () => {
    bot.stop('SIGTERM')
    if(scheduler) {scheduler.stop()}
    if (broadcaster) { broadcaster.stop() }
})
