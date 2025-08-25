import { exec } from "child_process";
import path from "path";

export function buildProject(id: string) {
    return new Promise((resolve) => {
        // Use process.cwd() instead of __dirname
        const projectPath = path.join(process.cwd(), "output", id);
        console.log("Building project at path:", projectPath);

        const child = exec(`cd ${projectPath} && npm install && npm run build`);

        child.stdout?.on('data', function(data) {
            console.log('Build stdout: ' + data);
        });
        child.stderr?.on('data', function(data) {
            console.log('Build stderr: ' + data);
        });

        child.on('close', function(code) {
            console.log('Build process exited with code:', code);
            resolve("");
        });

        child.on('error', function(error) {
            console.log('Build error:', error);
            resolve("");
        });
    });
}
