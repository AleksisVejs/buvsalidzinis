import axios from 'axios';

// Use environment variable for API base URL, fallback for local dev
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Starts a search by sending the product name to the backend.
 * @param {string} productName The product name to search for.
 * @returns {Promise<{searchId: string}>} A promise that resolves with the search ID.
 */
export const startSearch = async (productName) => {
  try {
    const response = await apiClient.post('/search', { productName });
    return response.data; // Should contain { searchId: string }
  } catch (error) {
    console.error('Error starting search:', error.response || error.message);
    throw new Error('Failed to initiate search. Please try again.');
  }
};

/**
 * Polls the backend for search results using the search ID.
 * @param {string} searchId The ID of the search to retrieve results for.
 * @returns {Promise<{status: string, results?: Array, errors?: Array, message?: string}>} A promise that resolves with the search status and results/errors.
 */
export const getResults = async (searchId) => {
  try {
    const response = await apiClient.get(`/results/${searchId}`);
    return response.data; // { status: 'pending' | 'completed' | 'error', results?: [...], errors?: [...], message?: '...' }
  } catch (error) {
    console.error('Error fetching results:', error.response || error.message);
    // Check if it was a 404 (Search ID not found)
    if (error.response && error.response.status === 404) {
        throw new Error(`Search ID ${searchId} not found.`);
    }
    throw new Error('Failed to fetch search results. Please try again later.');
  }
}; 