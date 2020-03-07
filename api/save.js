const express = require("express");

const router = express.Router();

router.post("/save", (req, res) => {
    console.log(req.body.save)
    res.cookie("save", req.body.save) // Creates a cookie with "save" data
    res.redirect("/") // Redirects user to the homepage (reloads the homepage)
})

module.exports = router;