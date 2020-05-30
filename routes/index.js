const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
    res.json({title: 'Hi There'})
});

module.exports = router;
