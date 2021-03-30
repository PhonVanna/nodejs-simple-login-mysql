const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const mysql = require('mysql');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload')



dotenv.config({ path: './.env'});

const app = express();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER, 
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));
app.use(fileUpload());

// parse url-encoded bodies (as sent by html forms)
app.use(express.urlencoded({ extended: false}));
// parse as json format
app.use(express.json());
app.use(cookieParser());

app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));

app.set('view engine', 'hbs');

db.connect((err) => {
    if(err) {
        console.log(err);
    }else{
        console.log('DB Succesfully Connected');
    }
});

// define routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

app.listen(3001, () => {
    console.log('Server started on Port 3001');
});
