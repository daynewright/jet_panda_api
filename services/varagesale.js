const cheerio = require('cheerio');
const request = require('request');

 exports.getItems = (area, tag) => {
    return new Promise(resolve => {
      request(
        `https://www.varagesale.com/m/${area}/find?q=${tag}`,
        (err, response, html) => {
          if (err) {
            resolve({ error: true, code: err });
          }
            const $ = cheerio.load(html);

            let results = [];

            $('.card').each((index, element) => {
              const image = $(element).find('img').attr('data-src');
              const price = $(element).find('.green.bold.font-sm').text().replace('$', '');
              const link = 'https://varagesale.com' + $(element).find('.js-analytics-click-item').attr('href');
              const title = $(element).find('.b-margin-0').text();
              const imageSplit = image.split('=');
              const id = imageSplit[imageSplit.length - 1];
              results.push({
                image,
                price,
                link,
                title,
                description: title,
                id: `${id}-VARAGESALE`,
                source: 'VarageSale'
              });
            });

            resolve(results);
        });
    });
  };