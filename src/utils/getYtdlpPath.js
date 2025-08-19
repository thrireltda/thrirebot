import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function()
{
    const platform = os.platform(); // win32 / linux / darwin
    const arch = os.arch();         // x64 / arm64
    const folder = `${platform}-${arch}`;
    const binary = platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
    return path.join(__dirname, '..', '..', 'bin', 'yt-dlp', folder, binary);
}