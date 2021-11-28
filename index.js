const express = require ('express');
const app = express();

const knex = require('knex');
const config = require('./knexfile')['development'];
const database = knex(config);

const bodyParser = require('body-parser');
app.use(bodyParser.json())
const bcrypt = require('bcrypt');

app.post('user', (request, response) => {
    const { user } = request.body
    bcrypt.hash(user.password, 12)
        .then(hashedPassword => {
            return database('user')
                .insert({
                    username: user.username,
                    password: hashedPassword
                }).returning('*')
        })
        .then(users => {
            const user = users[0]
            response.json({ user })
        })
})