const AppError = require("./AppError")
const statusText = require("./statusText")
const jwt = require("jsonwebtoken")
const isLogin = async function(req , res , next){
    let inputToken = req.headers["Authorization"] || req.headers["authorization"]
    if(!inputToken) return next(AppError.create(statusText.FAIL , 401 , "You should login first" , null))
    let token = inputToken.split(" ")[1]
    let tokenEncoded = await jwt.verify(token, process.env.JWT_SECRET)
    req.tokenDecoded = tokenEncoded
    next()
}

module.exports = isLogin