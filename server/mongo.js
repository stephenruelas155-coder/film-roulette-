
import 'dotenv/config';
import { MongoClient, ServerApiVersion } from 'mongodb';
import express from 'express'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const uri = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(join(__dirname, '../public')));
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../public/home.html'));
});


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const db = client.db('collection');
const collection = db.collection('films');

app.get('/api/films-with-ratings', async (req, res) => {
    try {
        const filePath = join(__dirname, '../public/database/films.json');
        const fileData = await readFile(filePath, 'utf8');
        const films = JSON.parse(fileData);

        const ratedFilms = await Promise.all(
            films.map(async (film) => {

                const params = new URLSearchParams({
                    query: film.title,
                    include_adult: 'false',
                    language: 'en-US'
                });

                if (film.year) {
                    params.set('year', String(film.year));
                }

                const response = await fetch(
                    `https://api.themoviedb.org/3/search/movie?${params}`,
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
                            accept: 'application/json'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(`TMDB error: ${response.status}`);
                }

                const data = await response.json();

                const match = data.results.find(movie =>
                    movie.title.toLowerCase() === film.title.toLowerCase()
                ) || data.results[0];

                return {
                    ...film,
                    tmdbId: match?.id ?? null,
                    tmdbRating: match?.vote_average ?? null,
                    tmdbVotes: match?.vote_count ?? null
                };
            })
        );

        res.json(ratedFilms);

    } catch (error) {
        console.error('TMDB error:', error);

        res.status(500).json({
            message: 'Unable to retrieve movie ratings',
            error: error.message
        });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});