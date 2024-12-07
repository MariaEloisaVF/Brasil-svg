import dotenv from 'dotenv';
import express from 'express'; 
import pg from 'pg';
import cors from 'cors';

dotenv.config();

const { Client } = pg;
const client = new Client({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB
});

async function conectar() {
    await client.connect();
    console.log('Conectado ao banco de dados!');
}

conectar();

// Configuração do Express
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

app.get('/svg/:estado/:municipio', async (req, res) => {
    let estado = req.params.estado;
    let municipio = req.params.municipio;

    console.log(`Recebida solicitação para estado: ${estado}, município: ${municipio}`);

    try {
        // Buscando o SVG do estado e do município
        let pathEstado = await client.query('SELECT ST_AsSVG(geom) FROM estado WHERE nome ILIKE $1', [estado]);
        let pathMunicipio = await client.query('SELECT ST_AsSVG(geom) FROM municipio WHERE nome ILIKE $1', [municipio]);
        let viewBox = await client.query('SELECT getViewBox($1) AS viewbox', [estado]);

        console.log('pathEstado:', pathEstado.rows);
        console.log('pathMunicipio:', pathMunicipio.rows);
        console.log('viewBox:', viewBox.rows);

        // Verificando se as consultas retornaram resultados
        if (pathEstado.rows.length === 0 || pathMunicipio.rows.length === 0 || viewBox.rows.length === 0) {
            return res.status(404).json({ error: 'Estado ou município não encontrado' });
        }

        res.json({
            pathestado: pathEstado.rows[0].st_assvg,
            pathmunicipio: pathMunicipio.rows[0].st_assvg,
            viewBox: viewBox.rows[0].viewbox
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao processar a requisição');
    }
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
