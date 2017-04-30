const express = require('express');
const bodyParser= require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const flash = require('express-flash')
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session')

var db;
var ObjectId = require('mongodb').ObjectID;

MongoClient.connect('mongodb://localhost:27017/learning-node', (err, database) => {
    if ( err ) return console.log( err );
    db = database;
    app.listen( 3000, () => {
        console.log( 'Listening on 3000' );
    });
})

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/assets'));
app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))
app.use(flash());

// Show index page with data
app.get( '/', ( req, res ) => {
    db.collection( 'quote' ).find().toArray(function(err, results) {
        console.log(results);
        res.render('index.ejs', {quotes: results});
    });
});

// Route for updating a quote
app.get( '/update/:id', ( req, res ) => {
    var unsafeToken = req.params.id;
    var token = unsafeToken.trim(unsafeToken);
    db.collection( 'quote' ).find({ '_id': ObjectId(token) }).toArray( function (err, result) {
        console.log(result);
        res.render('update.ejs', {quote: result});
    });
});

// save quotes
app.post( '/quotes', ( req, res ) => {
    db.collection( 'quote' ).save( req.body, ( err, result ) => {
        if ( err ) req.flash('error', err);
        else req.flash('success', 'Quote added successfully.');
        res.redirect( '/' );
    });
});

// update quote
app.post( '/update/edits', ( req, res ) => {
    db.collection('quote').update (
        { _id: ObjectId(req.body.quoteID) },
        { $set: {
            name: req.body.name,
            quote: req.body.quote
            }
        }, function (err, result) {
            if (err) {
                req.flash('error', err);
            } else {
                req.flash('success', 'Quote updated successfully');
            }
            res.redirect('/');
    });
});

// delete the quote
app.get('/delete/:id', (req, res)=>{
    var token = new ObjectId(req.params.id);
    db.collection('quote', function(err, collection) {
        collection.deleteOne({_id: token}, function(err, result){
            if (err) {
                req.flash('error', err);
            } else {
                req.flash('success', 'Quote deleted successfully');
            }
            res.redirect('/');
        });
    });

});
