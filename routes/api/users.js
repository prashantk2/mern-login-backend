const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const keys = require("../../config/keys");
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

const User = require("../../models/User");

router.post("/register", (req, res) => {
  const { success, errors } = validateRegisterInput(req.body);
  if (!success) {
    return res.status(200).json({ success, errors });
  }
  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      return res.status(200).json({ success: false, errors: "Email already exists" });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.json({ success: true, user }))
            .catch((err) => res.json({ success: false, error: 'Issue in hashing password' }))
        });
      });
    }
  });
});

router.post("/login", (req, res) => {
  const { error, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(200).json({ success: false, error });
  }
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email }).then((user) => {
    if (!user) {
      return res.status(200).json({ success: false, error: "Email not found" });
    }
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name,
        };
        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 31556926, // 1 year in seconds
          },
          (err, token) => {
            if (err)
              res.status(500).json({ error: "Error signing token", raw: err });
            res.json({
              success: true,
              token
            });
          }
        );
      } else {
        return res
          .status(200)
          .json({ success: false, error: "Password incorrect" });
      }
    });
  });
});

router.get('/userDetails', verifyToken, (req, res) => {
  try {
    const userDetails = User.findById(res.locals.userId);
    userDetails.exec((err, doc) => {
      if (err) {
        res.json({
          success: false,
          error: `Unable to load data`
        });
      } else {
        res.json({
          success: true,
          data: doc
        })
      }
    }) 
  } catch (error) {
    res.json({
      success: false,
      error: `Unable to load data`
    });
  }
});

function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    req.token = bearerHeader;

    //verifying user
    jwt.verify(req.token, 'secret', function (err, decoded) {
      if (err) {
        return res.json({
          status: 401,
          success: false,
          error: 'Invalid Token'
        })
      } else {
        res.locals.userId = decoded.id;
        next();
      }
    });
  } else {
    res.sendStatus(403)
  }
}

router.get('/listOfAllUsers', verifyToken, (req, res) => {
  try {
    const userDetails = User.find();
    userDetails.exec((err, doc) => {
      if (err) {
        res.status(400).send({
          success: false,
          error: `Unable to load data`
        });
      } else {
        res.status(200).send({
          success: true,
          data: doc
        })
      }
    }) 
  } catch (error) {
    res.status(400).send({
      success: false,
      error: `Unable to load data`
    });
  }
});

router.get('/getSingleUser/:id', verifyToken, (req, res) => {
  try {
    const userDetails = User.findById(req.params.id);
    userDetails.exec((err, doc) => {
      if (err) {
        if(err.name === 'CastError') {
          res.status(400).send({
            success: false,
            error: `Invalid user Id.`
          });
        } else {
          res.status(400).send({
            success: false,
            error: `Unable to load data`
          });
        }
      } else {
        res.status(200).send({
          success: true,
          data: doc
        })
      }
    }) 
  } catch (error) {
    res.status(400).send({
      success: false,
      error: `Unable to load data`
    });
  }
});

router.post('/update-user/:id',  (req, res) => {
  try{

    const userId = req.params.id;
    if(typeof userId === undefined || userId === '') {
      res.status(400).send({
        success: false,
        error: `Invalid user Id.`
      });
    }
    const userDetails = User.findById(req.params.id);
    userDetails.exec((err, doc) => {
      if (err) {
        res.status(400).send({
          success: false,
          error: `Unable to load data`
        })
      } else {
        User.findByIdAndUpdate(
          userId,
          req.body,
          (err) => {
            if(err) {
              res.status(400).send({
                success: false,
                error: `Unable to load data`
              });
            } else {
              res.status(200).send({
                success: true,
                data: doc
              })
            }
          }
        )
      }
    })
  } catch(error) {
    res.status(400).send({
      success: false,
      error: `Unable to load data`
    });
  }
})

module.exports = router;
