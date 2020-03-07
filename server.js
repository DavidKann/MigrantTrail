const express = require("express");
const cookieParser = require('cookie-parser')
const path = require("path");

const api = require("./api/save")

const app = express();
const port = 8000;

app.use(cookieParser())
app.use('/', express.static(__dirname + '/public'));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.sendFile("index.html")
})

// For saving
app.use("/api/", api)

app.listen(port, () => console.log(`Server online\nPort: ${port}`))