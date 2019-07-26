const express = require('express');
const cors = require('cors')
const DelayedResponse = require('http-delayed-response');
const bodyParser = require('body-parser');

const varageSale = require('./services/varageSale');
const offerUp = require('./services/offerUp');
const ebay = require('./services/ebay');
const facebook = require('./services/facebook');
const getAll = require('./services/all');

const app = express();

const allowedOrigins = ['http://localhost:3001', 'https://jet-panda.herokuapp.com'];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.get('/varagesale/:location', (req, res) => {
    varageSale.getItems('nashville-davidson-murfreesboro-franklin-tn-nc', req.query.search).then(resp => res.send(resp));
    // varageSale.getItems(req.params.location, req.query.search).then(resp => res.send(resp));
});

app.get('/offerup', (req, res) => {
    offerUp.getItems(req.query.search).then(resp => res.send(resp));
});

app.get('/ebay', (req, res) => {
    ebay.getItems(req.query.search).then(resp => res.send(resp));
});

app.get('/facebook', (req, res) => {
    facebook.getItems(req.query.search).then(resp => res.send(resp));
});

app.get('/all', (req, res) => {
  const delayed = new DelayedResponse(req, res);

  const slowfunction = () => {
    const search = encodeURI(req.query.search);
    getAll.getItems(search).then(resp => delayed.end(null, resp));
  }

  slowfunction(delayed.start(5000, 5000));
});

app.listen(process.env.PORT || 3000, function () {
    console.log(`Jet Panda API listening on port ${process.env.PORT || 3000}!`);
});

