import express from "express";
import cors from "cors";
import { simpleGit } from "simple-git";
import { generate } from "./utils.js";
import { getAllFiles } from "./files.js";
import path from "path";
import { fileURLToPath } from 'url';
import { uploadFile } from "./aws.js";
import { createClient } from "redis";

const publisher = createClient();
const subscriber = createClient();

publisher.connect();
subscriber.connect();

// Get the equivalent of __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

uploadFile("ryanhui/package.json", "/Users/ryanhui/vercel/dist/output/91c7m/package.json");

const app = express();
app.use(cors())
app.use(express.json());

// POSTMAN
app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
    const id = generate();
    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

    const files = getAllFiles(path.join(__dirname, `output/${id}`));

    console.log("Files:", files);

    files.forEach(async file => {
        await uploadFile(file.slice(__dirname.length + 1), file);
    })

    publisher.lPush("build-queue", id);
    publisher.hSet("status", id, "uploaded");

    res.json({
        id: id
    })
});

app.get("/status", async (require, res) => {
    const id = require.query.id;
    const response = await subscriber.hGet("status", id as string);
    res.json({
        status: response
    })
})

app.listen(3000);
