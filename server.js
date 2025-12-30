const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.use("/videos", express.static(path.join(__dirname, "data", "videos")));
app.use("/imgs", express.static(path.join(__dirname, "data", "imgs")));
const jsonDir = path.join(__dirname, "data", "json");
console.log("JSON Directory:", jsonDir);
// Ensure JSON directory exists, or throw an error
if (!fs.existsSync(jsonDir)) {
    console.error("JSON directory does not exist. Please prepare the directory and restart the server.");
    process.exit(1);
}
// API to fetch all sha256 IDs
app.get("/data/ids/:reviewerId", (req, res) => {
    const reviewerId = req.params.reviewerId;
    // console.log("Fetching sha256 list for reviewer:", reviewerId);
    fs.readdir(jsonDir, (err, files) => {
        if (err) {
            console.error("Error reading JSON directory:", err);
            res.status(500).send({ error: "Failed to read JSON directory" });
            return;
        }
        const sha256List = files
            .filter(file => file.endsWith(".json"))
            .map(file => path.basename(file, ".json"));
        res.send(sha256List);
    });
});

// API to fetch data by sha256
app.get("/data/:sha256", (req, res) => {
    const { sha256 } = req.params;
    const jsonFilePath = path.join(jsonDir, `${sha256}.json`);

    fs.readFile(jsonFilePath, "utf8", (err, data) => {
        if (err) {
            res.status(404).send({ error: "Data not found" });
            return;
        }
        res.send(JSON.parse(data));
    });
});

app.get("/data/:assetId/:partId", (req, res) => {
    const { assetId, partId } = req.params;
    const filePath = path.join(__dirname, "data", `${assetId}_${partId}.json`);

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            res.status(404).send({ error: "Data not found" });
            return;
        }
        res.send(JSON.parse(data));
    });
});

app.post("/submit", (req, res) => {
    const result = req.body;
    const resultsDir = path.join(__dirname, "results");
    // console.log("Received result:", result);
    if (!result.sha256) {
        res.status(400).send({ error: "Missing sha256 in result" });
        return;
    }

    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir);
    }

    const resultFile = path.join(resultsDir, `${result.sha256}.json`);
    fs.writeFile(resultFile, JSON.stringify(result, null, 2), (err) => {
        if (err) {
            res.status(500).send({ error: "Failed to save result" });
            return;
        }
        res.send({ message: "Result saved successfully" });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});