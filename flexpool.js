const request = require('request')
const FLEXPOOL_BASEURL ="https://api.flexpool.io/v2"

 const COINS = {
    ETHEREUM:'ETH',
    CHIA:'XCH'
}

const stats = async({coin=COINS.ETHEREUM, wallet}) => {
    return new Promise((resolve)=>{
        const url = `${FLEXPOOL_BASEURL}/miner/stats?coin=${coin}&address=${wallet}`
        console.log(`Pinging ${url} ...`)
        request({
            url,
            headers:{'accept':'application/json'}},
            (err,_,body)=>{
                if(err){
                    console.error(err)
                    throw new Error(err)
                }
                const {error, result} = JSON.parse(body)
                console.log(body)
                if(error){
                    console.error(error)
                    throw new Error(error)
                }

                const {
                    averageEffectiveHashrate,
                    currentEffectiveHashrate,
                    invalidShares,
                    reportedHashrate,
                    staleShares,
                    validShares
                } = result
                resolve({
                    averageEffectiveHashrate,
                    currentEffectiveHashrate,
                    invalidShares,
                    reportedHashrate,
                    staleShares,
                    validShares
                })
            })
    })
}
module.exports = {
    COINS,
    stats,
}