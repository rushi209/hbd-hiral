// Importing the packages that we need

const express = require("express");
const app = express();
const bp = require("body-parser");
const qr = require("qrcode");
const fs = require('fs');

// Using the ejs (Embedded JavaScript templates) as our template engine
// and call the body parser  - middleware for parsing bodies from URL
//                           - middleware for parsing json objects

app.set("view engine", "ejs");
app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());

// Simple routing to the index.ejs file
app.get("/", (req, res) => {
    res.render("index");
});

app.post("/surprise", (req, res) => {
    const url = req.body.url;

    // If the input is null return "Empty Data" error
    if (url.length === 0) res.send("Empty Data!");

    // Let us convert the input stored in the url and return it as a representation of the QR Code image contained in the Data URI(Uniform Resource Identifier)
    // It shall be returned as a png image format
    // In case of an error, it will save the error inside the "err" variable and display it

    qr.toDataURL(url, (err, src) => {
        if (err) res.send("Error occured");

        // Let us return the QR code image as our response and set it to be the source used in the webpage
        res.render("surprise", { src });
    });
});

app.get('/surprise', (req, res) => {
    res.redirect("/");
});

app.get("/view", function (req, res) {
    res.sendFile(__dirname + "/video/index.html");
  });

app.get("/video", function (req, res) {
    // Ensure there is a range given for the video
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Range header");
    }

    // get video stats (about 61MB)
    const videoPath = "video/HBD_Hiral.mp4";
    const videoSize = fs.statSync("video/HBD_Hiral.mp4").size;

    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Create headers
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);

    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath);

    // Stream the video chunk to the client
    videoStream.pipe(res);
});

// Setting up the port for listening requests
const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Server at 5000"));