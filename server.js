const express = require("express");
const fetch = require("node-fetch-commonjs");
const FormData = require("form-data");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const fs = require("fs");

let subtitles = {};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.post("/post", upload.single("file"), async (req, res) => {
  if (req.body.url) {
    // Handle request with URL parameter
    const data = {
      apiKey: "E4gLjTpp2x",
      model: "tiny",
      language: "auto-detect",
      shouldTranslate: false,
      downloadLink: req.body.url,
    };

    const response = await fetch("https://freesubtitles.ai/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const subtitles = await response.json();
      console.log(subtitles);
      if (subtitles.transcribeDataEndpoint) {
        res.send(subtitles);
      }
    } else {
      console.error("Failed to get subtitles:", response.statusText);
    }
  } else if (req.file && req.file.path && req.file.originalname) {
    // Handle request with file upload
    const stream = fs.createReadStream(req.file.path);

    const formData = new FormData();
    formData.append("file", stream, req.file.originalname);
    formData.append("apiKey", "E4gLjTpp2x");
    formData.append("model", "tiny");
    formData.append("language", "auto-detect");
    formData.append("shouldTranslate", "false");

    const response = await fetch("https://freesubtitles.ai/api", {
      method: "POST",
      headers: formData.getHeaders(),
      body: formData,
    });

    if (response.ok) {
      const subtitles = await response.json();
      console.log(subtitles);
      if (subtitles.transcribeDataEndpoint) {
        res.send(subtitles);
      }
    } else {
      console.error("Failed to get subtitles:", response.statusText);
    }
  } else {
    console.error("File data is missing or incomplete:", req.file);
  }
});

app.get("/get", async (req, res) => {
  console.log(subtitles.transcribeDataEndpoint);
  if (subtitles.transcribeDataEndpoint) {
    try {
      const response = await fetch(subtitles.transcribeDataEndpoint);
      const data = await response.json();
      console.log(data);
      res.send(data);
    } catch (error) {
      console.error("Error:", error);
    }
  } else {
    console.error("Please enter a transcribeDataEndpoint");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
