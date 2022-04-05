const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const fileupload = require('express-fileupload');

const logger = require("morgan");
app.use(logger("dev", {
    // hvis ALLE requests skal ses i loggen, kan næste linje udkommenteres
    skip: req => !req.url.endsWith(".html") && req.url.indexOf(".") > -1
}));

//const bodyParser = require('body-parser');
//vi har allerede fat i express så vi kan bruge den direkte - body parser skal ikke bruges mere(ikke afinstalleret endnu)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(fileupload({
    limits: {
       fileSize: 10 * 1024 * 1024
    } // 10mb
 }));

//const logger = require('morgan');

app.use(logger('dev'));

app.set('view engine', 'ejs');

app.set('views', './views');

app.use(express.static('public'));

require('./route.js')(app);



//run server
app.listen(port, (err) => {
    if (err) { console.log(err); }
    console.log(`Serveren kører på: http://localhost:${port}`);
});

//mongoose
const mongoose = require("mongoose");
// starter mongoDb og opretter forbindelsen til databasen, 
// også selv om variablen 'db' ikke benyttes
const db = mongoose.connect("mongodb://localhost:27017/H5beerproject");
