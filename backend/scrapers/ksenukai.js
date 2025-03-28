const puppeteer = require('puppeteer');

const BASE_URL = 'https://www.ksenukai.lv';

/**
 * Scrapes Ksenukai search results for a given product name using Puppeteer.
 * @param {string} productName The product name to search for.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of product objects.
 */
async function scrapeKsenukai(productName) {
  if (!productName) {
    console.error('Product name is required for scraping Ksenukai.');
    return [];
  }

  const encodedProductName = encodeURIComponent(productName);
  const searchUrl = `${BASE_URL}/meklesana?q=${encodedProductName}`;
  console.log(`Scraping Ksenukai: ${searchUrl}`);

  let browser = null;
  const products = [];

  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 30000 });

    // Selectors based on ksenukaiinfo.txt
    const productItemSelector = 'div[data-cy="lupa-search-result-product-card"]';
    const nameSelector = 'a.lupa-search-results-product-title-text';
    const priceSelector = 'div.catalog-taxons-product__price span.catalog-taxons-product-price__item-price > span:first-child';
    const urlSelector = 'a.lupa-search-results-product-title-text';
    const imageUrlSelector = 'img.lupa-images-main-image';

    // Wait for product items
    try {
        await page.waitForSelector(productItemSelector, { timeout: 15000 });
    } catch (waitError) {
        console.log(`No product items found for "${productName}" on Ksenukai within timeout, or selector is incorrect.`);
        // It's possible Ksenukai shows a "no results" message instead of an empty list.
        // You might want to add a check here for that specific message if needed.
        return [];
    }

    // Extract product data
    const extractedProducts = await page.$$eval(productItemSelector, (items, selectors, baseUrl) => {
      const results = [];
      items.forEach(item => {
        try {
          const nameElement = item.querySelector(selectors.nameSelector);
          const priceElement = item.querySelector(selectors.priceSelector);
          const urlElement = item.querySelector(selectors.urlSelector);
          const imageElement = item.querySelector(selectors.imageUrlSelector);

          const name = nameElement ? nameElement.innerText.trim() : null;

          // Price parsing: Extract number, handle comma decimal separator
          let price = null;
          if (priceElement) {
            const priceText = priceElement.innerText.replace(/\s/g, '').replace(',', '.'); // Remove spaces, use dot decimal
            price = parseFloat(priceText);
            if (isNaN(price)) price = null;
          }

          let url = urlElement ? urlElement.getAttribute('href') : null;
          if (url && !url.startsWith('http')) {
            url = `${baseUrl}${url}`;
          }

          let imageUrl = imageElement ? imageElement.getAttribute('src') : null;
          // Ksenukai images seem to be absolute URLs already, but check just in case
          if (imageUrl && !imageUrl.startsWith('http')) {
             imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
          }

          if (name && price !== null && url) {
            results.push({
              store: 'Ksenukai',
              name,
              price,
              currency: 'EUR',
              url,
              imageUrl,
            });
          }
        } catch (e) {
          console.error('Error parsing individual Ksenukai product item:', e);
        }
      });
      return results;
    }, { nameSelector, priceSelector, urlSelector, imageUrlSelector }, BASE_URL);

    products.push(...extractedProducts);

    // TODO: Implement Ksenukai pagination logic if necessary

    console.log(`Found ${products.length} products from Ksenukai for "${productName}".`);

  } catch (error) {
    console.error(`Error scraping Ksenukai for "${productName}":`, error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return products;
}

module.exports = { scrapeKsenukai }; 