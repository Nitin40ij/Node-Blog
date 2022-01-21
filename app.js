const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("express-flash");

// dotenv is used before the models
require("dotenv").config();
//importing the database connection
const connect = require("./models/db");

// requiring userRoutes
const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const postRoutes= require("./routes/postRoutes");
//const { collection } = require("./models/user");

const app = express();
const PORT = process.env.PORT || 5000;
//Database connection
connect();
//expression session middleware
const store = new MongoDBStore({
  uri: process.env.DB,
  collection: "session",
});
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
    store: store,
  })
);
// flash middleware
app.use(flash());
app.use((req, res, next) => {
  res.locals.message = req.flash();
  next();
});

// load static files with the help of middleware which is built-in
app.use(express.static("./views"));
app.use(express.urlencoded({ extended: true }));
//set ejs
app.set("view engine", "ejs");
//set route
app.use(userRoutes);
app.use(profileRoutes);
app.use(postRoutes);

//create server
app.listen(PORT, () => {
  console.log(`Server running on port number: ${PORT}`);
});
