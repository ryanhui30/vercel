const express = require("express");
const { S3 } = require("aws-sdk");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

// Validate environment variables
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const endpoint = process.env.R2_ENDPOINT;
const bucketName = process.env.R2_BUCKET_NAME || "vercel";

if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error("Missing required R2 configuration in environment variables");
}

const s3 = new S3({
    accessKeyId,
    secretAccessKey,
    endpoint
});

const app = express();

// Use a middleware that handles all requests without route parsing
app.use(async (req: any, res: any, next: any) => {
    const host = req.hostname;
    const id = host.split(".")[0];
    const filePath = req.path;

    console.log("Request received:", { host, id, filePath });

    const contents = await s3.getObject({
        Bucket: bucketName,
        Key: `dist/${id}${filePath}`
    }).promise();

    const type = filePath.endsWith("html") ? "text/html" :
                filePath.endsWith("css") ? "text/css" :
                "application/javascript";
    res.set("Content-Type", type);
    res.send(contents.Body);
});

app.listen(3001, () => {
    console.log("Server running on port 3001");
});
