import { YtDlp } from 'ytdlp-nodejs';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';



dotenv.config();

const app = express();
app.use(cors())
app.use(express.static('public'));
app.use(express.json());

const ytdlp = new YtDlp();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.post('/video', async (req, res) => {
    const url = req.body['url'];
    var tituloVideo = "";

    try {

        const saidaTitulo = await ytdlp.getTitleAsync(
            url,
        );

        tituloVideo = saidaTitulo.replace(/[\\/:*?"<>|#]/g, '')
            .replace(/\s+/g, '_')
            .replace(/_+/g, '_')
            .trim();

        const output = await ytdlp.downloadAsync(
            url,
            {

                output: tituloVideo,
                format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4",
                onProgress: (progress) => {
                    console.log(progress);
                },
                // others args

            }
        );
        console.log('Download completed:', output);
    } catch (error) {
        console.error('Error:', error);
    }

    console.log(tituloVideo);

    res.json({ downloadUrl: `${process.env.SERVER}/download/${tituloVideo}.mp4` });

})

app.get('/download/:file', (req, res) => {
    const filePath = path.join(__dirname, req.params.file);

    res.download(filePath, (err) => {
        if (err) {
            console.log("Erro ao baixar arquivo");
        } else {
            console.log("Sucesso!");
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log("Erro ao deletar arquivo");
                } else {
                    console.log("Sucesso ao deletar arquivo");
                }
            });
        }
    })
})


app.listen(3000, () => {
    //console.log(`Servidor rodando em http://localhost:${3000}`);
    console.log("Servidor rodando");
});