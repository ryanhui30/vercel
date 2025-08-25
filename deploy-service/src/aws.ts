const { S3 } = require("aws-sdk");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const endpoint = process.env.R2_ENDPOINT;
const bucketName = process.env.R2_BUCKET_NAME || "vercel";

if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error("Missing required R2 configuration");
}

const s3 = new S3({
    accessKeyId,
    secretAccessKey,
    endpoint
});

async function downloadS3Folder(prefix: string) {
    console.log("Starting download for:", prefix);

    const allFiles = await s3.listObjectsV2({
        Bucket: bucketName,
        Prefix: prefix
    }).promise();

    console.log("Found files:", allFiles.Contents?.length || 0);

    const allPromises = allFiles.Contents?.map(async ({Key}: {Key: string}) => {
        return new Promise(async (resolve) => {
            if (!Key) {
                resolve("");
                return;
            }
            const finalOutputPath = path.join(process.cwd(), Key);
            console.log("Downloading:", Key);

            const outputFile = fs.createWriteStream(finalOutputPath);
            const dirName = path.dirname(finalOutputPath);
            if (!fs.existsSync(dirName)){
                fs.mkdirSync(dirName, { recursive: true });
            }
            s3.getObject({
                Bucket: bucketName,
                Key
            }).createReadStream().pipe(outputFile).on("finish", () => {
                console.log("Finished:", Key);
                resolve("");
            });
        })
    }) || [];

    console.log("Awaiting downloads...");
    await Promise.all(allPromises);
    console.log("All downloads completed");
}

function copyFinalDist(id: string) {
    const folderPath = path.join(process.cwd(), `output/${id}/dist`);
    const allFiles = getAllFiles(folderPath);
    allFiles.forEach((file: string) => {
        uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
    })
}

const getAllFiles = (folderPath: string) => {
    let response: string[] = [];

    const allFilesAndFolders = fs.readdirSync(folderPath);
    allFilesAndFolders.forEach((file: string) => {
        const fullFilePath = path.join(folderPath, file);
        if (fs.statSync(fullFilePath).isDirectory()) {
            response = response.concat(getAllFiles(fullFilePath))
        } else {
            response.push(fullFilePath);
        }
    });
    return response;
}

const uploadFile = async (fileName: string, localFilePath: string) => {
    const fileContent = fs.readFileSync(localFilePath);
    const response = await s3.upload({
        Body: fileContent,
        Bucket: "vercel",
        Key: fileName,
    }).promise();
    console.log(response);
}

module.exports = {
    downloadS3Folder,
    copyFinalDist,
    uploadFile
};
