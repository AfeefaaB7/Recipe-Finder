const http = require("http");
const fs = require("fs");
const path = require("path");
const https = require("https");
const url = require("url");

const PORT = 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  const serveFile = (filePath, contentType) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("File not found");
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
      }
    });
  };

  // Serve frontend files
  if (pathname === "/" || pathname === "/index.html") {
    serveFile(path.join(__dirname, "public", "index.html"), "text/html");
  } else if (pathname.endsWith(".css")) {
    serveFile(path.join(__dirname, "public", pathname), "text/css");
  } else if (pathname.endsWith(".js")) {
    serveFile(path.join(__dirname, "public", pathname), "application/javascript");
  }

  // Handle search request
  else if (pathname === "/search") {
    const recipeName = parsedUrl.query.name;

    // If no query — fetch recipes A–Z (initial load)
    if (!recipeName) {
      const letters = "abcdefghijklmnopqrstuvwxyz".split("");
      let allMeals = [];
      let completed = 0;

      letters.forEach((letter) => {
        const apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`;
        https.get(apiUrl, (apiRes) => {
          let data = "";
          apiRes.on("data", (chunk) => (data += chunk));
          apiRes.on("end", () => {
            try {
              const parsed = JSON.parse(data);
              if (parsed.meals) allMeals = allMeals.concat(parsed.meals);
            } catch (err) {
              console.error("Error parsing:", err);
            }
            completed++;
            if (completed === letters.length) {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ meals: allMeals }));
            }
          });
        });
      });
    }

    // If query provided — fetch matching meals
    else {
      const apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(recipeName)}`;
      https
        .get(apiUrl, (apiRes) => {
          let data = "";
          apiRes.on("data", (chunk) => (data += chunk));
          apiRes.on("end", () => {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(data);
          });
        })
        .on("error", () => {
          res.writeHead(500);
          res.end(JSON.stringify({ error: "API fetch failed" }));
        });
    }
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
