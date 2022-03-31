/**
 * @param {string} arg 
 * @param {*} defaultValue
 * @param {ERROR_CODE} invalidErrorCode 
 * @param {ERROR_CODE} missingErrorCode 
 * @returns {*}
 */

 const parseInteger = (value,invalidErrorCode) =>{
    const parsed = parseInt(value)
    if(parsed !== NaN){
        return parsed
    }
    throw new Error(invalidErrorCode)
}
const parsePositiveInteger = (value,invalidErrorCode) => {
    const parsed = parseInteger(value)
    if(parsed > 0){
        return parsed
    }
    throw new Error(invalidErrorCode)
}
const parseBoolean = (value) => {
    if(value === 'true'){
        return true
    }
    if(value === 'false'){
        return false
    }
    throw new Error(invalidErrorCode)
}
const parseString = (value, invalidErrorCode) => {
    if(value.length){
        return value
    }
    throw new Error(invalidErrorCode)
}

const ARG_TYPES = {
    STRING:0,
    INTEGER:1,
    POSITIVE_INTEGER:2,
    BOOLEAN:3,
    COIN:4
}
const parseCoin = (value,invalidErrorCode) => {
    if(value.toUpperCase() === 'ETH' || value.toUpperCase() === 'XCH') {return value.toUpperCase()}
    throw new Error(invalidErrorCode)
}
const parseCliArg=(argv,arg,type, invalidErrorCode, missingErrorCode,defaultValue)=>{
    const argIdx = argv.indexOf(`--${arg}`)
    if(argIdx>-1 && argIdx<argv.length-1){
        value = argv[argIdx+1]
        let transformer = () => {throw new Error(invalidErrorCode)}
        switch(type){
            case ARG_TYPES.BOOLEAN: transformer=parseBoolean;break;
            case ARG_TYPES.INTEGER: transformer=parseInteger;break;
            case ARG_TYPES.POSITIVE_INTEGER: transformer=parsePositiveInteger;break;
            case ARG_TYPES.STRING: transformer=parseString;break;
            case ARG_TYPES.COIN:transformer=parseCoin;break;
        }
        if(transformer(value, invalidErrorCode)){
            return value
        }
        if(!value){ //fixme zero, false or null are failing now
            throw new Error(invalidErrorCode)
        }
        return value
    }
    if(defaultValue){
        return defaultValue
    }
    throw new Error(missingErrorCode)
}

module.exports = {parseCliArg,ARG_TYPES}