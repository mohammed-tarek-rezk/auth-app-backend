//requires
const express = require('express')
require('dotenv').config()
require('express-async-errors')
require("./db")
const userRoute = require('./routes/user.route')
const cors = require("cors")
const AppError = require("./utils/AppError")
const statusText = require("./utils/statusText")
const path = require("path")
const emailRoute = require('./routes/email.route')
//app variable
const app = express()
const port = process.env.PORT


//middlewares
app.use(express.raw())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
//route handlers
app.use("/users", userRoute) 
app.use("/mail", emailRoute) 
app.use("/images", express.static(path.join(__dirname , "images"))) 

app.use("*" , (req , res , next)=>{
  next(AppError.create(statusText.ERROR , 404 , "not found" , null))
})

//errorHandler
app.use((err , req ,res ,next)=>{
  let statusCode = err.statusCode || 500
  res.status(statusCode).send({
    status: err.status || statusText.ERROR,
    message: err.message || "Something went wrong", 
    errors: err.data || []
  })
})

//start server
app.listen(port, () => console.log(`Example app listening on port ${port}!`))