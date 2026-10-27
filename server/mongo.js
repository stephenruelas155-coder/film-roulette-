
import 'dotenv/config';
import { MongoClient, ServerApiVersion } from 'mongodb';
import express from 'express'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const db = client.db('collection');
const collection = db.collection('films');

