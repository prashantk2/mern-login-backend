const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const bodyParser = require("body-parser");
const passport = require("passport");
const indexRouter = require("./routes")
const users = require("./routes/api/users");

// DB Config
const db = require("./config/keys").mongoURI;

const app = express();

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
); 
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(db, { useUnifiedTopology: true ,useNewUrlParser: true })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));

app.use(cors());

// Passport middleware
app.use(passport.initialize());
// Passport configuration
require("./config/passport")(passport);
// Routes
app.use("/",indexRouter)
app.use("/api/users", users);

const port = 5000;
app.listen(port, () => console.log(`Server up and running on port ${port} !`));
