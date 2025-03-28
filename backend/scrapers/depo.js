const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://online.depo.lv';
const IMAGE_BASE_URL = 'https://images.depo.lv';

/**
 * Helper function for delay since waitForTimeout isn't available in this Puppeteer version
 * @param {number} ms - Milliseconds to wait
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Scrapes Depo search results for a given product name using Puppeteer.
 * @param {string} productName The product name to search for.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of product objects.
 */
async function scrapeDepo(productName) {
  if (!productName) {
    console.error('Product name is required for scraping Depo.');
    return [];
  }

  const encodedProductName = encodeURIComponent(productName);
  const searchUrl = `${BASE_URL}/search/${encodedProductName}`;
  console.log(`Scraping Depo: ${searchUrl}`);

  let browser = null;
  const products = [];

  try {
    // Launch Puppeteer with more realistic browser settings
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-features=site-per-process', // This can help with some cookie consent iframes
        '--window-size=1366,768'
      ],
      defaultViewport: { width: 1366, height: 768 }
    });
    
    const page = await browser.newPage();

    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Set extra headers to appear more like a real browser
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9,lv;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Connection': 'keep-alive',
      'Cache-Control': 'max-age=0'
    });

    // Enable JavaScript and cookies
    await page.setJavaScriptEnabled(true);
    
    // Log all console messages from the page for debugging
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

    // Navigate to the search page with increased timeout
    await page.goto(searchUrl, { 
      waitUntil: 'networkidle2', 
      timeout: 60000 
    });
    
    // Take a screenshot immediately
    await page.screenshot({ path: 'depo_initial.png', fullPage: true });
    
    // Wait to make sure the page is fully loaded
    await delay(3000);
    
    // APPROACH 1: Try to handle cookie consent by pressing Tab and Enter
    try {
      // Find a cookie consent button by common text patterns
      const cookieButton = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a.btn, input[type="button"]'));
        for (const button of buttons) {
          const text = button.textContent.toLowerCase();
          if (text.includes('accept') || text.includes('agree') || 
              text.includes('consent') || text.includes('piekrist') || 
              text.includes('cookie')) {
            return true;
          }
        }
        return false;
      });
      
      if (cookieButton) {
        // Press Tab a few times to try to focus cookie button, then press Enter
        await page.keyboard.press('Tab');
        await delay(500);
        await page.keyboard.press('Tab');
        await delay(500);
        await page.keyboard.press('Tab');
        await delay(500);
        await page.keyboard.press('Enter');
        
        console.log('Attempted keyboard navigation for cookie consent');
        await delay(2000);
      }
      
      // Take screenshot after cookie handling
      await page.screenshot({ path: 'depo_after_cookie.png', fullPage: true });
    } catch (cookieError) {
      console.log('Error during cookie consent handling:', cookieError);
    }
    
    // Let the page settle after cookie handling
    await delay(3000);
    
    // DIRECT PRODUCT EXTRACTION: Use JavaScript execution to find products directly 
    const extractedProducts = await page.evaluate((baseUrl, imageBaseUrl) => {
      const products = [];
      
      // Look for links containing product paths
      const productLinks = document.querySelectorAll('a[href*="/product/"]');
      
      // Set to track URLs we've already processed
      const processedUrls = new Set();
      
      productLinks.forEach(link => {
        try {
          // Get URL and normalize it
          let url = link.getAttribute('href');
          if (!url) return;
          
          // Add base URL if needed
          if (!url.startsWith('http')) {
            url = baseUrl + (url.startsWith('/') ? url : `/${url}`);
          }
          
          // Skip if we've seen this URL already
          if (processedUrls.has(url)) return;
          processedUrls.add(url);
          
          // Find product information
          const container = link.closest('div, article, tr, li');
          if (!container) return;
          
          // Get product name - try the link text, title, or alt text
          let name = link.textContent?.trim() || 
                     link.getAttribute('title')?.trim() || 
                     link.querySelector('img')?.getAttribute('alt')?.trim();
                     
          if (!name) return;
          
          // Try to find price
          let price = null;
          
          // Method 1: Look for EUR symbol and numbers
          const priceMatch = container.textContent.match(/(\d+[,.]\d+)\s*€/);
          if (priceMatch) {
            price = parseFloat(priceMatch[1].replace(',', '.'));
          }
          
          // Method 2: Look for elements that might contain the price
          if (!price) {
            const possiblePriceElements = container.querySelectorAll('.price, [class*="price"], [class*="cost"], [class*="value"]');
            for (const el of possiblePriceElements) {
              const text = el.textContent.trim();
              const match = text.match(/(\d+[,.]\d+)/);
              if (match) {
                price = parseFloat(match[1].replace(',', '.'));
                break;
              }
            }
          }
          
          // Look for an image
          let imageUrl = null;
          const img = container.querySelector('img');
          if (img && img.src) {
            imageUrl = img.src;
            if (!imageUrl.startsWith('http')) {
              imageUrl = imageBaseUrl + (imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`);
            }
          }
          
          // Add to results if we have essential info
          products.push({
            store: 'Depo',
            name,
            price, // May be null
            currency: 'EUR',
            url,
            imageUrl,
          });
        } catch (error) {
          // Silently skip errors for individual products
        }
      });
      
      return products;
    }, BASE_URL, IMAGE_BASE_URL);
    
    console.log(`Extracted ${extractedProducts.length} products directly from the page.`);
    
    // Take a final screenshot
    await page.screenshot({ path: 'depo_final.png', fullPage: true });
    
    // Save the final HTML for debugging
    const htmlContent = await page.content();
    fs.writeFileSync('depo_final.html', htmlContent);
    
    // Add products if we found any
    if (extractedProducts.length > 0) {
      products.push(...extractedProducts);
    } else {
      console.log("No products found using direct extraction. Check screenshots for details.");
    }

  } catch (error) {
    console.error(`Error scraping Depo for "${productName}":`, error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return products;
}

module.exports = { scrapeDepo }; 