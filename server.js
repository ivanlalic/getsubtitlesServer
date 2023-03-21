const express = require('express');
const fetch = require("node-fetch-commonjs");
const FormData = require('form-data');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


let subtitles = {};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });



  app.post('/post', upload.single('file'), async (req, res) => {

    const { url } = req.body;
    if (url) {
      const data = {
        apiKey: "E4gLjTpp2x",
        model: "tiny",
        language: "auto-detect",
        shouldTranslate: false,
        downloadLink: url,
      };
      const response = await fetch("https://freesubtitles.ai/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        subtitles = await response.json();
        console.log(subtitles);
        if (subtitles.transcribeDataEndpoint) {
          res.send(subtitles);
        }
      } else {
        console.error("Failed to get subtitles:", response.statusText);
      }
    } else {
      const file = req.file;
      const formData = new FormData();
      formData.append("file", file.buffer, file.originalname);
      const response = await fetch("https://freesubtitles.ai/api", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
  
      if (response.ok) {
        subtitles = await response.json();
        console.log(subtitles);
        if (subtitles.transcribeDataEndpoint) {
          res.send(subtitles);
        }
      } else {
        console.error("Failed to get subtitles:", response.statusText);
      }
    }
  });

  app.get('/get', async (req, res) => {
    console.log(subtitles.transcribeDataEndpoint)
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