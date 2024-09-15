
class AppError extends Error{
    constructor(statusCode, message){
        super()
    }

    create(status , statusCode , msg , data = null){
        this.status = status 
        this.statusCode = statusCode
        this.message = msg
        this.data = data
        return this;
    }
}


module.exports = new AppError()