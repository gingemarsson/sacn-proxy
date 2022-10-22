import { Low, JSONFile } from 'lowdb';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { State } from '../models/models.js';
import { getCategoryLogger } from './utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const file = join(__dirname, '../../db.json');
const adapter = new JSONFile<State>(file);
const db = new Low<State>(adapter);

const log = getCategoryLogger('DB');

export const readFromDb = async () => {
    await db.read();
    log('Reading from DB');
    return db;
};

export const writeToDb = () => {
    db.write();
};
