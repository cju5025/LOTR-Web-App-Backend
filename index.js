const express = require ('express');
const app = express();

const cors = require('cors');
app.use(cors());

app.use(express.urlencoded({extended:true}));
app.use(express.json());

const knex = require('knex');
const config = require('./knexfile')['development'];
const database = knex(config);

const { Model } = require('objection');
Model.knex(database);

const bodyParser = require('body-parser');
app.use(bodyParser.json())
const bcrypt = require('bcrypt');

const User = require('./Models/User.js');

app.get('/users', (request, response) => {
    User.query()
        .then(users => {
            response.json({ users })
        })
})

app.post('/users', (request, response) => {
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
        }).catch(error => response.json(error.message))
});

app.listen(4000);