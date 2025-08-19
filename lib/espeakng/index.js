import { spawn } from "child_process";

export default async function(resposta, audioPath)
{
    return new Promise(_ =>
    {
        const wavTemp = audioPath.replace('.mp3', '.wav');
        const espeakng = spawn('espeak-ng', ['-v', 'pt-br', '-s', '175', '-w', wavTemp]);
        espeakng.stdin.write(resposta);
        espeakng.stdin.end();
    })
}