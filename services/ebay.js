const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

exports.getItems = async (search) => {
    const browser = await puppeteer.launch({
        args: [
           '--no-sandbox',
           '--disable-setuid-sandbox',
         ]
       });
    const page = await browser.newPage();
    await page.goto(`https://www.ebay.com/sch/i.html?_nkw=${search}&LH_BIN=1&_sop=12`, {waitUntil: 'networkidle0'});
    await page.setViewport({
        width: 1200,
        height: 800
    });

    await autoScroll(page);

    const html = await page.content();
    const $ = cheerio.load(html);

    let results = [];

    $('.s-item').each((i, element) => {
        const image = $(element).find('.s-item__image-img').attr('src');
        const price = $(element).find('.s-item__price').text().replace('$', '');
        const shipping = $(element).find('.s-item__shipping').text();
        const link = $(element).find('.s-item__link').attr('href');
        const title = $(element).find('.s-item__title').text().trim();
        const description = $(element).find('.s-item__subtitle').text().trim();
        // const id = $(element).find('.s-item__link').attr('data-track');

        if(!title.toUpperCase().includes('SPONSORED') && !title.toUpperCase().includes('NEW LISTING')) {
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

    await browser.close();
    return results;
};

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}