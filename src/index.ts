import express from "express";
import cors from "cors";
import { simpleGit } from "simple-git";
import { generate } from "./utils.js";
import { getAllFiles } from "./files.js";
import path from "path";
import { fileURLToPath } from 'url';

// Get the equivalent of __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors())
app.use(express.json());

// POSTMAN
app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    const id = generate();
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

    const files = getAllFiles(path.join(__dirname, `output/${id}`));
    console.log("Files:", files); // Add this line

    res.json({
        id: id
    })
});

app.listen(3000);
