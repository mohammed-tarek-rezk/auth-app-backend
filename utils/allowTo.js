const AppError = require("./AppError")
const statusText = require("./statusText")
const User = require("./../models/user.model")
const allowTo =  function(...roles){

    return async function(req, res, next){
        let loginUser =req.tokenDecoded
        if(!loginUser) return next(AppError.create(statusText.ERROR , 401 , "you cannot access this model" , null))
        let {_id} = loginUser;
        let user = await User.findById(_id)
        if(!user) return next(AppError.create(statusText.ERROR , 401 , "you cannot access this model Try to login Again" , null))
        if(!roles.includes(user.role)) return next(AppError.create(statusText.ERROR , 401 , "you cannot access this model Try to login With valid role" , null)) 
        next()
    }
}

module.exports = allowTo;