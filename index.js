const express = require ('express');
const app = express();

const knex = require('knex');
const config = require('./knexfile')['development'];
const database = knex(config);


app.listen(4000, () => console.log('Listening'))