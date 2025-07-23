import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function getFFmpegPath() {
    const platform = os.platform(); // win32 / linux / darwin
    const arch = os.arch();         // x64 / arm64

    const folder = `${platform}-${arch}`;
    const binary = platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';

    return path.join(__dirname, '..', '..', 'bin', 'ffmpeg', folder, binary);
}
