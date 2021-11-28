const express = require ('express');
const app = express();

const knex = require('knex');
const config = require('./knexfile')['development'];
const database = knex(config);

const bodyParser = require('body-parser');
app.use(bodyParser.json())
const bcrypt = require('bcrypt');