require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");

const DBConnect = require("./src/config/dbconnect");
const indexRouter = require("./src/router/index");

DBConnect();

const app = express();

const Port = process.env.PORT || 3007;

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  }),
);

// Flash
app.use(flash());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//create a static folder
app.use(express.static("public"));

// EJS global variables
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.session.user || null;

  next();
});

// Setup EJS
app.set("view engine", "ejs");
app.set("views", "./src/views");

app.use(indexRouter);

app.listen(Port, () => {
  console.log(`Server is running on port: ${Port}`);
});
