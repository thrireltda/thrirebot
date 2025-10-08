import os from 'os';
import { fileURLToPath } from 'url';
import path from 'path';

export default function() {
    const platform = os.platform(); // win32 / linux / darwin
    const arch = os.arch();         // x64 / arm64
    const folder = `${platform}-${arch}`;
    const binary = platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.join(__dirname, '..', '..', '..', 'bin', 'yt-dlp', folder, binary);
}