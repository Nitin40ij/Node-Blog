//this contain call back functions:
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const users = require("../models/user");
const { redirect } = require("express/lib/response");

const loadSignup = (req, res) => {
  title = "Create new account";
  const errors = [];
  res.render("register", { title, errors: [], inputs: {} ,login:false});
};

const loadLogin = (req, res) => {
  title = "User login";
  res.render("login", { title, errors: [], inputs: {} ,login:false});
};

const loginValidations = [
  check("email").not().isEmpty().withMessage("The email is required!"),
  check("password").not().isEmpty().withMessage("password required!"),
];

const postLogin = async (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //console.log(errors.array())
    res.render("login", {
      title: "User login",
      errors: errors.array(),
      inputs: req.body,
    login:false});
  } else {
    const checkEmail = await users.findOne({ email });
    // console.log(checkEmail);
    if (checkEmail !== null) {
      const id = checkEmail._id;
      const dbPass = checkEmail.password;
      const passVerify = await bcrypt.compare(password, dbPass);
      if (passVerify) {
        //create token
        const token = jwt.sign({ userID: id }, process.env.JWT_SECRET, {
          expiresIn: "8d",
        });
        //create session variable
        req.session.user = token;
        res.redirect("profile");
      } else {
        res.render("login", {
          title: "User login",
          errors: [{ msg: "Incorrect password" }],
          inputs: req.body,
       login:false });
      }
    } else {
      res.render("login", {
        title: "User login",
        errors: [{ msg: "Email not found" }],
        inputs: req.body,login:false
      });
    }

    // res.send("logged in");
  }
};

const registerValidations = [
  check("name")
    .isLength({ min: 3, max: 15 })
    .isAlpha()
    .withMessage("Name is required and it should be 3 char long"),
  check("email").isEmail().withMessage("valid email is required"),
  check("password")
    .isLength({ min: 6, max: 16 })
    .isNumeric()
    .withMessage("password must be 6 characters long"),
];

const postRegister = async (req, res) => {
  //destructuring the email,name and password
  const { name, email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    title = "Create new account";
    res.render("register", {
      title,
      errors: errors.array(),
      inputs: req.body,
    login:false});
    // console.log(errors.array());
  } else {
    // res.send("form submitted");
    try {
      const userEmail = await users.findOne({ email });
      if (userEmail == null) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        // console.log("this is strong salt :" ,salt);
        const newUser = new users({
          name: name,
          email: email,
          password: hashed,
        });
        // registering the user now
        try {
          const createdNewUser = await newUser.save();
          //this success is nothing but the key we can take any name of the key..
          req.flash("success", "Your account has been created succesfully 🙂");
          // console.log(createdNewUser);
          res.redirect("/login");
        } catch (error) {
          console.log(error.message);
        }
      } else {
        res.render("register", {
          title: "Create new account",
          errors: [{ msg: "This email already exist!! 🤨" }],
          inputs: req.body,
       login:false });
      }

      // console.log(userEmail);
    } catch (error) {
      console.log(error.message);
    }
  }
};
module.exports = {
  loadSignup,
  loadLogin,
  registerValidations,
  postRegister,
  postLogin,
  loginValidations,
};
