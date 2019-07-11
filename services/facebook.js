const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

exports.getItems = async (search) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://www.facebook.com/marketplace/search/?query=${search}`, {waitUntil: 'networkidle0'});
    // await page.setGeolocation({latitude: 59.95, longitude: 30.31667});

    const html = await page.content();
    const $ = cheerio.load(html);

    let results = [];

    $('._7yc._3ogd').each((i, element) => {
        const link = `https://www.facebook.com/${$(element).find('a').attr('href')}`;
        const image = $(element).find('img').attr('src');
        const price = $(element).find('._f3l._4x3g').first().text().replace('$', '');
        const title = $(element).find('img').attr('title');
        const location = $(element).find('span._7yi').text();

        if(title.toUpperCase() !== 'SPONSORED' && !(results.filter(i => i.image === image).length)) {
            results.push({
                image,
                price,
                link,
                title,
                location,
                id: `${link.split('item/')[1].slice(0, -1)}-FACEBOOK`,
                source: 'facebook'
            });
        }
    });
    await browser.close();

    return results;
};