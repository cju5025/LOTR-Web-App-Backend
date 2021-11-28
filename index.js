const express = require ('express');
const app = express();

const cors = require('cors');
app.use(cors());

require('dotenv').config()

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
const jwt = require('jsonwebtoken');

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

app.post('/login', (request, response) => {
    const { user } = request.body
    
    database('users')
    .select()
    .where({ username: user.username })
    .first()
    .then(retrievedUser => {
        if (!retrievedUser) throw new Error ('User not found')
        return Promise.all([
            bcrypt.compare(user.password, retrievedUser.password),
            Promise.resolve(retrievedUser)
        ])
    })
    .then(results => {
        const arePasswordsTheSame = results[0]
        const user = results[1]

        if (!arePasswordsTheSame) throw new Error ('Incorrect Password')

        const payload = { username: user.username }
        const secret = process.env.SECRET
        jwt.sign(payload, secret, (error, token) => {
            if (error) throw new Error ("Signing didn't work")
            response.json({ token })
        })
    }).catch(error => response.json(error.message))
})

app.listen(4000);