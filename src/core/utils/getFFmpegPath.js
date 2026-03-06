import os from 'os';
import fs from 'fs';
import path from 'path';

export default function() {
    const root = `${global.appRoot}/bin/ffmpeg`;
    const installation = `${os.platform()}-${os.arch()}`;
    const binary = fs.readdirSync(`${root}/${installation}`)[0];
    return path.join(root, installation, binary);
}