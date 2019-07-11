const cloudscraper = require('cloudscraper');
const NodeGeocoder = require('node-geocoder');
const cheerio = require('cheerio');

exports.getItems = search => {
    return new Promise(resolve => {
        cloudscraper.get(`https://offerup.com/search/?q=${search}`).then(html => {
            const $ = cheerio.load(html);

            let results = [];

            $('#db-item-list > a').each((i, element) => {
                const image = $(element).find('img').attr('data-src');
                const price = $(element).find('div > div > div > span').text().replace('$', '');
                const link = 'https://offerup.com' + $(element).attr('href');
                const title = $(element).find('div > div > span').first().text().trim();
                const location = $(element).find('div > div > span').last().text().trim();
                const id = $(element).attr('href').split('detail/')[1];
                
                if(price.toUpperCase() !== 'SOLD' && title.toUpperCase() !== 'AD') {
                    results.push({
                        image,
                        price,
                        link,
                        title,
                        description: title,
                        location,
                        id: `${id.slice(0, -1)}-OFFERUP`,
                        source: 'offerUp'
                    });
                }
            });

            return resolve(results);
        });
    }); 
};