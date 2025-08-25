const aws = require("./aws");
const utils = require("./utils");
const { createClient } = require("redis");
const { copyFinalDist } = require("./aws");

const subscriber = createClient();
const publisher = createClient();



async function main() {
    await subscriber.connect();
    await publisher.connect();
    console.log("Connected to Redis");

    while(true) {
        console.log("Waiting for build task...");
        const response = await subscriber.brPop('build-queue', 0);

        const id = response.element;
        console.log("Processing ID:", id);

        await aws.downloadS3Folder(`output/${id}`);
        console.log("Download completed");

        await utils.buildProject(id);
        console.log("Build completed");

        await copyFinalDist(id);
        console.log("Copy completed");

        await publisher.hSet("status", id, "deployed");
        console.log(`Status updated: ${id} -> deployed`);
    }
}

main();
