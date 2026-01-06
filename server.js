const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.json());
app.use("/videos", express.static(path.join(__dirname, "data", "videos")));
app.use("/imgs", express.static(path.join(__dirname, "data", "imgs")));
const jsonDir = path.join(__dirname, "data", "jsons");
const resultDir = path.join(__dirname, "data", "results");
console.log("JSON Directory:", jsonDir);

app.get("/zh", (req, res) => {
    res.sendFile(path.join(__dirname, "public/zh/index.html"));
});

app.get("/en", (req, res) => {
    res.sendFile(path.join(__dirname, "public/en/index.html"));
});

// Ensure JSON directory exists, or throw an error
if (!fs.existsSync(jsonDir)) {
    console.error("JSON directory does not exist. Please prepare the directory and restart the server.");
    process.exit(1);
}
// API to fetch all sha256 IDs
const crypto = require("crypto");
app.get("/data/ids/:reviewerId/:totalUserNum", (req, res) => {
    const reviewerId = parseInt(req.params.reviewerId);
    const totalUserNum = parseInt(req.params.totalUserNum);

    if (
        isNaN(reviewerId) ||
        isNaN(totalUserNum) ||
        reviewerId < 1 ||
        reviewerId > totalUserNum
    ) {
        return res.status(400).send({ error: "Invalid reviewerId or totalUserNum" });
    }

    const reviewerIndex = reviewerId - 1;
    // 先读 result 目录，收集已经标注过的 sha256
    fs.readdir(resultDir, (err, resultFiles) => {
        if (err) {
            console.error("Error reading result directory:", err);
            return res.status(500).send({ error: "Failed to read result directory" });
        }

        const finishedSet = new Set(
            resultFiles
                .filter(f => f.endsWith(".json"))
                .map(f => path.basename(f, ".json"))
        );

        // 再读 jsonDir（待标注池）
        fs.readdir(jsonDir, (err, files) => {
            if (err) {
                console.error("Error reading JSON directory:", err);
                return res.status(500).send({ error: "Failed to read JSON directory" });
            }

            const assignedIds = [];

            files
                .filter(file => file.endsWith(".json"))
                .forEach(file => {
                    const baseName = path.basename(file, ".json");

                    // 已经标过的直接跳过
                    if (finishedSet.has(baseName)) return;

                    // sha256 前 8 位 hex → int
                    const hashPrefix = baseName.slice(0, 8);
                    const hashInt = parseInt(hashPrefix, 16);
                    if (isNaN(hashInt)) return;

                    const modVal = hashInt % totalUserNum;

                    if (modVal === reviewerIndex) {
                        assignedIds.push(baseName);
                    }
                });

            res.send(assignedIds);
        });
    });
});

// API to fetch data by sha256
app.get("/data/:sha256", (req, res) => {

    const { sha256 } = req.params;
    console.log("JSON Directory Accessed:", sha256);
    const jsonFilePath = path.join(jsonDir, `${sha256}.json`);

    fs.readFile(jsonFilePath, "utf8", (err, data) => {
        if (err) {
            res.status(404).send({ error: "Data not found" });
            return;
        }
        res.send(JSON.parse(data.replace(/: NaN/g, ': null')
            .replace(/: Infinity/g, ': null')
            .replace(/: -Infinity/g, ': null')));
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
    if (!result.sha256) {
        res.status(400).send({ error: "Missing sha256 in result" });
        return;
    }

    if (!fs.existsSync(resultDir)) {
        fs.mkdirSync(resultDir);
    }

    const resultFile = path.join(resultDir, `${result.sha256}.json`);
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