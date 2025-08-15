import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../.env');

dotenv.config({ path: envPath });

// Validate environment variables
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const endpoint = process.env.R2_ENDPOINT;

if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error("Missing required R2 configuration in environment variables");
}

const s3 = new S3Client({
    credentials: {
        accessKeyId,
        secretAccessKey
    },
    endpoint,
    region: "auto"
});

export const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.send(new PutObjectCommand({
        Body: fileContent,
        Bucket: process.env.R2_BUCKET_NAME || "vercel",
        Key: fileName,
    }));
    console.log(response);
}
