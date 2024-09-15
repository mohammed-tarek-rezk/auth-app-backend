
const { validationResult, body } = require('express-validator');
const AppError = require('../utils/AppError');
const statusText = require('../utils/statusText');
const User = require("./../models/user.model");
let jwtGenerator = require('../utils/jwtGeneration');
const roles = require('../utils/roles');

const getUsers =  async(req , res)=>{
    let limit = req.query.limit || 15;
    let page = req.query.page || 1;
    let skip = (page - 1) * limit;
    let users = await User.find({}).limit(limit).skip(skip)
    res.send({status: statusText.SUCCESS, data: {users}})
}

const getSingleUser =  async(req , res, next)=>{
    let loginUser =req.tokenDecoded
    let {id} = req.params
    try{
        let user = await User.findById(id)
        if(!user) return next(AppError.create(statusText.FAIL , 404 , 'User not found' , null))
        if(user.email !== loginUser.email) {
            if(loginUser.role !== roles.ADMIN){
                return next(AppError.create(statusText.FAIL , 401 , "You cannot access this user" , null))
            }
        }
        return res.send({status: statusText.SUCCESS, data: {user}})
    }catch{
        next(AppError.create(statusText.FAIL , 404 , 'Invalid ID' , null))
    }
}

const deleteSingleUser =  async(req , res, next)=>{
    let loginUser =req.tokenDecoded
    let {id} = req.params
    try{
        let user = await User.findById(id)
        if(!user) return next(AppError.create(statusText.FAIL , 404 , 'User not found' , null))
        if(user.email !== loginUser.email) {
            if(loginUser.role !== roles.ADMIN){
                return next(AppError.create(statusText.FAIL , 401 , "You cannot delete this user" , null))
            }
        }
        await User.findByIdAndDelete(id)
        return res.send({status: statusText.SUCCESS, message: 'User deleted successfully'})
    }catch{
        next(AppError.create(statusText.FAIL , 500 , 'Error deleting user' , null))
    }
}
const updateSingleUser =  async(req , res, next)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty()) return next(AppError.create(statusText.FAIL , 400 , 'invalid user data' , errors.array()))
    let loginUser =req.tokenDecoded
    let {id} = req.params
    let {name , email , password} = req.body
    try{
        let user = await User.findById(id)
        if(!user) return next(AppError.create(statusText.FAIL , 404 , 'User not found' , null))
        if(user.email !== loginUser.email) {
            if(loginUser.role !== roles.ADMIN){
                return next(AppError.create(statusText.FAIL , 401 , "You cannot update this user" , null))
            }
        }
        let userCounts = await User.find({email , _id: {$ne: id}}).countDocuments()
        if(userCounts > 0) return next(AppError.create(statusText.FAIL , 400 , 'Email already exists' , null))
        let hashedPassword = await await require("bcrypt").hash(password, 10);
        let updatedUser = await User.findOneAndUpdate({_id: id}, {$set: {username:name, email:email , password: hashedPassword , avatar: req?.file?.filename  , role: loginUser.role === roles.ADMIN ? req.body.role : undefined }})
        return res.send({status: statusText.SUCCESS, data: {updatedUser: {...updatedUser._doc, ...{username:name , email , avatar: req?.file?.filename ,role: loginUser.role === roles.ADMIN ? req.body.role : undefined }}}})
    }catch{
        next(AppError.create(statusText.FAIL , 404 , 'Invalid ID' , null))
    }
}


const addNewUser =  async(req , res, next)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty()) return next(AppError.create(statusText.FAIL , 400 , 'invalid user data' , errors.array()))
    let{name , email , password} = req.body
    let checkUser= await User.findOne({ email: email})
    if(checkUser) return next(AppError.create(statusText.FAIL , 400 , 'Email already exists' , null))
    let newUser = new User({username : name.trim(), email : email.trim(), password : password.trim(), avatar: req?.file?.filename })
    await newUser.save()
    newUser.password = undefined;
    res.status(201).json({status: statusText.SUCCESS, message: 'User added successfully', data: newUser})
}

const login =  async(req , res, next)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty()) return next(AppError.create(statusText.FAIL , 400 , 'invalid user data' , errors.array()))
    let{email , password} = req.body
    let checkUser= await User.findOne({ email: email}).select("+password")
    if(!checkUser) return next(AppError.create(statusText.FAIL , 401 , 'invalid user data' , null))
    checkPassword = await require("bcrypt").compare(password , checkUser.password)
    if(!checkPassword) return next(AppError.create(statusText.FAIL , 401 , 'invalid user data' , null))
    let token =  await jwtGenerator({_id: checkUser._id , email: checkUser.email , role: checkUser.role})
    checkUser.password = undefined;
    res.status(200).json({status: statusText.SUCCESS, message: 'User Login successfully', data: {...checkUser._doc, token}})
}



module.exports = {
    getUsers,
    addNewUser,
    login,
    getSingleUser,
    updateSingleUser,
    deleteSingleUser
}