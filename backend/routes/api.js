const express = require('express');
const { v4: uuidv4 } = require('uuid');

// Import scraper functions
const { scrapeDepo } = require('../scrapers/depo');
const { scrapeKsenukai } = require('../scrapers/ksenukai');
// TODO: Import other scrapers here as they are created

// Import grouping utility
const { groupProducts } = require('../utils/grouping');

const router = express.Router();

// In-memory storage for simplicity. Replace with DB/Cache in production.
const searchResults = {};

// Configuration for search results
const RESULTS_TTL = 60 * 60 * 1000; // Keep results for 1 hour (in milliseconds)

// Clean up old results periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(searchResults).forEach(searchId => {
    if (searchResults[searchId].timestamp && (now - searchResults[searchId].timestamp) > RESULTS_TTL) {
      console.log(`Removing expired search results for ID: ${searchId}`);
      delete searchResults[searchId];
    }
  });
}, 15 * 60 * 1000); // Run cleanup every 15 minutes

// POST /api/search
// Starts a new product search
router.post('/search', (req, res) => {
  const { productName } = req.body;

  if (!productName) {
    return res.status(400).json({ error: 'productName is required' });
  }

  const searchId = uuidv4();
  searchResults[searchId] = { 
    status: 'pending', 
    results: [], 
    errors: [],
    timestamp: Date.now(), // Add timestamp for TTL tracking
    productName // Store the product name for reference
  };

  console.log(`Search started for "${productName}" with ID: ${searchId}`);

  // --- Scraper Orchestration ---
  const scrapers = [
      { name: 'Depo', func: scrapeDepo },
      { name: 'Ksenukai', func: scrapeKsenukai },
      // TODO: Add other scraper functions here
  ];

  // Start scrapers asynchronously (don't await the Promise.allSettled here)
  Promise.allSettled(scrapers.map(scraper => scraper.func(productName)))
    .then(results => {
      const allProducts = [];
      let overallStatus = 'completed'; // Assume completion unless an error occurs
      const scraperErrors = [];

      results.forEach((result, index) => {
        const scraperName = scrapers[index].name;
        if (result.status === 'fulfilled') {
          console.log(`Scraper ${scraperName} succeeded with ${result.value.length} items.`);
          allProducts.push(...result.value);
        } else {
          // If any scraper fails, mark the overall status as potentially partial or error
          overallStatus = 'error'; // Or 'partial' depending on requirements
          const errorMessage = `Scraper ${scraperName} failed: ${result.reason.message || result.reason}`;
          console.error(errorMessage);
          scraperErrors.push({ scraper: scraperName, error: errorMessage });
          // Optionally store more detailed error information
        }
      });

      // Store the aggregated results and update status
      searchResults[searchId].results = allProducts;
      searchResults[searchId].status = overallStatus;
      searchResults[searchId].errors = scraperErrors;

      if(overallStatus === 'completed') {
        console.log(`Search ${searchId} completed successfully.`);
      } else {
        console.warn(`Search ${searchId} completed with errors.`);
      }

    }).catch(orchestrationError => {
      // Catch potential errors in Promise.allSettled itself (unlikely but possible)
      console.error(`Critical error during scraper orchestration for ${searchId}:`, orchestrationError);
      searchResults[searchId].status = 'error';
      searchResults[searchId].errors.push({ scraper: 'Orchestration', error: orchestrationError.message || 'Unknown orchestration error' });
    });
  // --- End Scraper Orchestration ---

  // Return the searchId immediately
  res.status(202).json({ searchId }); // 202 Accepted
});

// GET /api/results/:searchId
// Retrieves the status and results of a search
router.get('/results/:searchId', (req, res) => {
  const { searchId } = req.params;
  
  if (!searchId) {
    return res.status(400).json({ error: 'searchId is required' });
  }
  
  const searchData = searchResults[searchId];

  if (!searchData) {
    console.log(`Search ID not found in /results endpoint: ${searchId}`);
    return res.status(404).json({ 
      error: `Search ID ${searchId} not found.`,
      message: 'The search results may have expired or been cleaned up. Please start a new search.'
    });
  }

  // Update timestamp to keep active searches alive
  searchResults[searchId].timestamp = Date.now();

  // --- Result Retrieval/Status Check ---
  let groupedResults = searchData.results;
  
  // Group results if completed and there are results to group
  if (searchData.status !== 'pending' && searchData.results.length > 0) {
    try {
      groupedResults = groupProducts(searchData.results);
      console.log(`Grouped ${searchData.results.length} products into ${groupedResults.length} groups for search ${searchId}.`);
    } catch (error) {
      console.error(`Error grouping products for search ${searchId}:`, error);
      // Fall back to ungrouped results
      groupedResults = searchData.results;
    }
  }
  
  return res.status(200).json({
    searchId,
    status: searchData.status,
    results: groupedResults,
    errors: searchData.errors || [],
    productName: searchData.productName,
    count: groupedResults.length,
    message: searchData.status === 'error' ? 'One or more scrapers failed. Results may be incomplete.' : undefined
  });
});

// Add this route handler for GET /api/search/:searchId
router.get('/search/:searchId', (req, res) => {
  const { searchId } = req.params;
  
  if (!searchId) {
    return res.status(400).json({ error: 'searchId is required' });
  }
  
  if (!searchResults[searchId]) {
    console.log(`Search ID not found: ${searchId}`);
    return res.status(404).json({ 
      error: `Search ID ${searchId} not found.`,
      message: 'The search results may have expired or been cleaned up. Please start a new search.'
    });
  }
  
  const { status, results, errors, productName } = searchResults[searchId];
  
  // Update timestamp to keep active searches alive
  searchResults[searchId].timestamp = Date.now();
  
  // If the search is complete, check if we need to group the results
  let groupedResults = results;
  if (status === 'completed' && results.length > 0) {
    try {
      groupedResults = groupProducts(results);
      console.log(`Grouped ${results.length} products into ${groupedResults.length} groups.`);
    } catch (error) {
      console.error('Error grouping products:', error);
      // Fall back to ungrouped results
      groupedResults = results;
    }
  }
  
  return res.json({
    searchId,
    status,
    results: groupedResults,
    errors,
    productName,
    count: groupedResults.length
  });
});

module.exports = router; 