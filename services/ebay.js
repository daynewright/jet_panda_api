const cheerio = require('cheerio');
const request = require('request');

exports.getItems = search => {
    return new Promise(resolve => {
        request(`https://www.ebay.com/sch/i.html?_nkw=${search}&LH_BIN=1&_sop=12`,
        (err, response, html) => {
            const $ = cheerio.load(html);

            let results = [];

            $('.s-item').each((i, element) => {
                const image = $(element).find('#icImg').attr('src');
                const price = $(element).find('.s-item__price').text().replace('$', '');
                const shipping = $(element).find('.s-item__shipping').text();
                const link = $(element).find('.s-item__link').attr('href');
                const title = $(element).find('.s-item__title').text().trim();
                const description = $(element).find('.s-item__subtitle').text().trim();
                // const id = $(element).find('.s-item__link').attr('data-track');

                if(title.toUpperCase() !== 'SPONSORED') {
                    results.push({
                        image,
                        price,
                        shipping,
                        link,
                        title,
                        description,
                        source: 'ebay'
                    });
                }
            });

            resolve(results);
        });
    });
};