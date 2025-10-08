import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import fs from "fs";

export default async function(path, startFolder, recursionLevel = 0) {
    const __filename = fileURLToPath(path);
    const __dirname = dirname(__filename);
    return await loop(join(__dirname, startFolder), recursionLevel);
}
async function loop(path, recursionLevel, currentRecursionLevel = 0) {
    let js = [];
    const dirents = fs.readdirSync(path, { withFileTypes: true });
    for (const dirent of dirents) {
        switch (dirent.isDirectory()) {
            case true:
                if (currentRecursionLevel >= recursionLevel) break;
                let fs = await loop(join(dirent.parentPath, dirent.name), recursionLevel, currentRecursionLevel + 1);
                for (const f of fs)
                    js.push(f);
                break;
            case false:
                let p = join(dirent.parentPath, dirent.name);
                let f = pathToFileURL(p).href;
                let i = (await import(f)).default;
                if (i === null || i === undefined) continue;
                js.push({rootPath: dirent.parentPath, content: i});
                break;
        }
    }
    return js;
}