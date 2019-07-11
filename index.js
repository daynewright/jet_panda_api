const express = require('express');
const bodyParser = require('body-parser');

const varageSale = require('./services/varageSale');
const offerUp = require('./services/offerUp');
const ebay = require('./services/ebay');
const facebook = require('./services/facebook');

const app = express();

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

app.get('/all', async (req, res) => {
    const VARAGESALE = await varageSale.getItems('nashville-davidson-murfreesboro-franklin-tn-nc', req.query.search);
    const OFFERUP = await offerUp.getItems(req.query.search);
    const EBAY = await ebay.getItems(req.query.search);
    const FACEBOOK = await facebook.getItems(req.query.search);

    res.send({
        VARAGESALE,
        OFFERUP,
        EBAY,
        FACEBOOK
    });
});

app.listen(process.env.PORT || 3000, function () {
    console.log('Jet Panda API listening on port 3000!');
  });