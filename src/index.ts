import express from "express";
import cors from "cors";
import { generate } from "./utils";

const app = express();
app.use(cors())
app.use(express.json());

// POSTMAN
app.post("/deploy", async (req, res) => {
    const repoUrl = req.body.repoUrl;
});

app.listen(3000);
