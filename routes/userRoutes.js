const express=require("express");

//Router is a built-in middleware.
const router=express.Router();
//user controller
const {loadSignup,loadLogin,registerValidations,postRegister,postLogin,loginValidations}=require("../controllers/userController")
const { stopLogin }= require("../middlewares/auth");


router.get("/",stopLogin,loadSignup)
router.get("/login",stopLogin,loadLogin)
router.post( "/register",registerValidations , postRegister)
router.post("/postLogin",loginValidations,postLogin);

module.exports=router;