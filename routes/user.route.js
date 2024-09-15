const express = require("express");
const { getUsers, addNewUser, login, getSingleUser, updateSingleUser , deleteSingleUser } = require("../controllers/user.controller");
const userRoute = express.Router();
const { body } = require("express-validator");
const AppError = require("../utils/AppError");
const statusText = require("../utils/statusText");
const isLogin = require("../utils/isLogin");
const allowTo = require("../utils/allowTo");
const roles = require("../utils/roles");
const multer  = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images")
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1]
    const name = `${req.body.name.replace(" " , "-")}-${Date.now()}.${ext}`
    cb(null, name)
  }
})
const fileFilter =(req , file , cb)=>{
  if(file.mimetype.split("/")[0] === 'image'){
    cb(null, true)
  }else{
    cb(AppError.create(statusText.FAIL, 400, "Only image files are allowed" ,null), false)
  }
 
}
const upload = multer({ storage: storage , fileFilter })
userRoute
  .route("/")
  .get(isLogin,allowTo(roles.ADMIN, roles.MODERATOR),getUsers)
  .post(
    upload.single("avatar"),
    [
      body("name").trim().notEmpty().withMessage("Title is required"),
      body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Enter valid Email address"),
      body("password").notEmpty().withMessage("Password is required").isStrongPassword().withMessage("Enter valid Strong Password"),
    ],
    addNewUser
  );
userRoute
  .route("/:id")
  .get(isLogin,getSingleUser)
  .delete(isLogin,deleteSingleUser)
  .put(isLogin,upload.single("avatar"),[
        body("name").trim().notEmpty().withMessage("Title is required"),
        body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Enter valid Email address"),
        body("password").notEmpty().withMessage("Password is required").isStrongPassword().withMessage("Enter valid Strong Password"),
      ],updateSingleUser)
      


userRoute
  .route("/login")
  .post(
    [
      body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Enter valid Email address"),
      body("password").notEmpty().withMessage("Password is required"),
    ],
    login
  );

module.exports = userRoute;
