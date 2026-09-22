require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const DBConnect = require("./src/config/dbconnect");
const path = require("path");
const session = require("express-session");
const indexRouter = require("./src/router/index");

DBConnect();

const app = express();

const Port = process.env.PORT || 3007;

app.use(
  session({
    secret: "keyboardcat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//create a static folder
app.use(express.static("public"));

// Setup EJS
app.set("view engine", "ejs");
app.set("views", "views");

app.use(indexRouter)

app.listen(Port, () => {
  console.log(`Server is running on port: ${Port}`);
});
