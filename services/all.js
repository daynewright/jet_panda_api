const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const cloudscraper = require('cloudscraper');

exports.getItems = async (search) => {
    // launch browser //
    const browser = await puppeteer.launch({
        args: [
           '--no-sandbox',
           '--disable-setuid-sandbox',
         ]
       });

    // open new page //
    let page = await browser.newPage();
    // hold all results //
    let results = [];

    //EBAY RESULTS //
    await page.goto(`https://www.ebay.com/sch/i.html?_nkw=${search}&LH_BIN=1&_sop=12`, {waitUntil: 'networkidle0'});
    await page.setViewport({
        width: 1200,
        height: 800
    });

    const autoScroll = async (page) => {
        await page.evaluate(async () => {
          await new Promise((resolve, reject) => {
            let totalHeight = 0
            let distance = 100
            let timer = setInterval(() => {
              let scrollHeight = document.body.scrollHeight
              window.scrollBy(0, distance)
              totalHeight += distance
              if(totalHeight >= scrollHeight){
                clearInterval(timer)
                resolve()
              }
            }, 100)
          })
        })
      }

    await autoScroll(page);

    const htmlEbay = await page.content();
    const $_Ebay = cheerio.load(htmlEbay);

    $_Ebay('.s-item').each((i, element) => {
        const image = $_Ebay(element).find('.s-item__image-img').attr('src');
        const price = $_Ebay(element).find('.s-item__price').text().replace('$', '');
        const shipping = $_Ebay(element).find('.s-item__shipping').text();
        const link = $_Ebay(element).find('.s-item__link').attr('href');
        const title = $_Ebay(element).find('.s-item__title').text().trim();
        const description = $_Ebay(element).find('.s-item__subtitle').text().trim();
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

    // FACEBOOK RESULTS //
    await page.goto(`https://www.facebook.com/marketplace/search/?query=${search}`, {waitUntil: 'networkidle0'});
    // await page.setGeolocation({latitude: 59.95, longitude: 30.31667});

    const htmlFacebook = await page.content();
    const $_facebook = cheerio.load(htmlFacebook);

    $_facebook('._7yc._3ogd').each((i, element) => {
        const link = `https://www.facebook.com/${$_facebook(element).find('a').attr('href')}`;
        const image = $_facebook(element).find('img').attr('src');
        const price = $_facebook(element).find('._f3l._4x3g').first().text().replace('$', '');
        const title = $_facebook(element).find('img').attr('title');
        const location = $_facebook(element).find('span._7yi').text();

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

    //OFFERUP RESULTS //
    await cloudscraper.get(`https://offerup.com/search/?q=${search}`).then(html => {
        const $_offerUp = cheerio.load(html);

        $_offerUp('#db-item-list > a').each((i, element) => {
            const image = $_offerUp(element).find('img').attr('data-src');
            const price = $_offerUp(element).find('div > div > div > span').text().replace('$', '');
            const link = 'https://offerup.com' + $_offerUp(element).attr('href');
            const title = $_offerUp(element).find('div > div > span').first().text().trim();
            const location = $_offerUp(element).find('div > div > span').last().text().trim();
            const id = $_offerUp(element).attr('href').split('detail/')[1];
            
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
        })
    });

    // VARAGESALE RESULTS //
    await page.goto(`https://www.varagesale.com/m/nashville-davidson-murfreesboro-franklin-tn-nc/find?q=${search}`)

    const htmlVarageSale = await page.content();
    const $_varageSale = cheerio.load(htmlVarageSale);

    $_varageSale('.card').each((index, element) => {
        const image = $_varageSale(element).find('img').attr('data-src');
        const price = $_varageSale(element).find('.green.bold.font-sm').text().replace('$', '');
        const link = 'https://varagesale.com' + $_varageSale(element).find('.js-analytics-click-item').attr('href');
        const title = $_varageSale(element).find('.b-margin-0').text();
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

    await browser.close();
    
    return results;
};