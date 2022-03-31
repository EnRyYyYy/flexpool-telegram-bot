const { Telegraf } = require('telegraf')
const { stats } = require('./flexpool')
const {Scheduler} = require('./scheduler')
const {ERROR_CODES}=require('./error-codes')
const { parseCliArg, ARG_TYPES } = require('./utils')

let scheduler
let chatId

const main = () => {
    const argv = process.argv
    console.log(`= Staring server mode with params: =============================`)
    const wallet = parseCliArg(argv,'wallet', ARG_TYPES.STRING, ERROR_CODES.INVALID_WALLET_ARG, ERROR_CODES.MISSING_WALLET_ARG)
    console.log(`wallet: ${wallet}`)
    const bot = parseCliArg(argv,'bot', ARG_TYPES.STRING,ERROR_CODES.INVALID_BOT_ARG, ERROR_CODES.MISSING_BOT_ARG)
    console.log(`bot: ${bot}`)
    const interval = parseCliArg(argv,'interval',ARG_TYPES.POSITIVE_INTEGER, ERROR_CODES.INVALID_INTERVAL_ARG,ERROR_CODES.MISSING_INTERVAL_ARG,1)
    console.log(`interval: ${interval}`)
    const coin = parseCliArg(argv,'coin', ARG_TYPES.COIN, ERROR_CODES.INVALID_COIN_ARG, ERROR_CODES.MISSING_COIN_ARG, 'ETH')
    console.log(`coin: ${coin}`)
    console.log(`==================================================================`)
    
    
    
    
    

    try{
        telegraf = new Telegraf(bot)
    }catch(ex){
        throw new Error(ERROR_CODES.TELEGRAM_TOKEN_INVALID)
    }

    try{
        // Bot setup
        

        // Scheduler setup
        scheduler = new Scheduler(async ()=>{
            try{
                console.log(`wallet: ${wallet}`)
                const {
                    averageEffectiveHashrate,
                    currentEffectiveHashrate,
                    invalidShares,
                    reportedHashrate,
                    staleShares,
                    validShares
                } = await stats({wallet, coin})
                if(telegraf && chatId){
                    telegraf.telegram.sendMessage(
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
        },interval)

        scheduler.start()

        telegraf.start(async (ctx) => {

            let user = ctx.chat.username
            chatId = ctx.chat.id
            if(scheduler) {
                scheduler.start()
            }
            ctx.reply(`Welcome, ${user}. Your bot started`)    
        })

        
        telegraf.command('report', async (ctx) => {
            const latest = await db.extractLatestData()
            ctx.reply(latest)
        })

        telegraf.launch()  
        console.log('Bot is running...')


    }catch(ex){
        if (telegraf && chatId) {
            telegraf.telegram.sendMessage(chatId, 'A fatal error occurred while running the bot. Pleaase restart it manually')
        }
        console.error(ex)
        throw new Error(ERROR_CODES.INTERNAL_APPLICATION_ERROR)
    }
}

try{
    main()
}
catch(ex){
    let message = "[ERR] "
    switch(ex.message){
        case ERROR_CODES.TELEGRAM_TOKEN_INVALID:
            message = "Telegram bot token invalid"
        case ERROR_CODES.TELEGRAM_TOKEN_MISSING:
            message = "Missing required param '--bot'."
        case ERROR_CODES.WALLET_MISSING:
            message = "Missing required param '--wallet'"
        default:
            message = "Internal application error"
    }
    console.log(message)
    console.error(ex)
}


// Enable graceful stop
process.once('SIGINT', () => {
    if(telegraf) {telegraf.stop('SIGINT')}
    if(scheduler) {scheduler.stop()}
    if (broadcaster) { broadcaster.stop() }
})
process.once('SIGTERM', () => {
    if(telegraf) {telegraf.stop('SIGTERM')}
    if(scheduler) {scheduler.stop()}
    if (broadcaster) { broadcaster.stop() }
})
