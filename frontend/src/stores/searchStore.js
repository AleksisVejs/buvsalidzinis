import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { startSearch, getResults } from '../services/api';

export const useSearchStore = defineStore('search', () => {
  // State
  const searchId = ref(null);
  const searchTerm = ref('');
  const results = ref([]);
  const status = ref('idle'); // idle | loading | polling | completed | error
  const error = ref(null); // Stores general error message
  const errorDetails = ref([]); // Stores specific scraper errors
  const pollingInterval = ref(null);
  const pollFrequency = 3000; // Poll every 3 seconds
  const maxPollTime = 60000; // Stop polling after 60 seconds
  let pollStartTime = 0;

  // Getters
  const isLoading = computed(() => status.value === 'loading' || status.value === 'polling');
  const hasError = computed(() => status.value === 'error');
  const isCompleted = computed(() => status.value === 'completed');

  // Actions
  async function initiateSearch(productName) {
    if (isLoading.value) return; // Prevent concurrent searches

    // Reset state
    searchId.value = null;
    searchTerm.value = productName;
    results.value = [];
    error.value = null;
    errorDetails.value = [];
    status.value = 'loading';
    stopPolling(); // Clear any previous polling

    try {
      const data = await startSearch(productName);
      searchId.value = data.searchId;
      status.value = 'polling';
      pollStartTime = Date.now();
      startPolling();
    } catch (err) {
      console.error('Search initiation failed:', err);
      error.value = err.message || 'Failed to start the search process.';
      status.value = 'error';
    }
  }

  async function pollResults() {
    if (!searchId.value) return;

    // Timeout check
    if (Date.now() - pollStartTime > maxPollTime) {
        console.warn(`Polling timed out for search ID: ${searchId.value}`);
        error.value = 'Search timed out. The server took too long to respond.';
        status.value = 'error';
        stopPolling();
        return;
    }

    try {
      const data = await getResults(searchId.value);

      if (data.status === 'completed') {
        results.value = data.results || [];
        status.value = 'completed';
        error.value = null; // Clear any previous polling errors
        errorDetails.value = [];
        stopPolling();
        console.log('Search completed:', results.value);
      } else if (data.status === 'error') {
        results.value = data.results || []; // Store partial results if any
        error.value = data.message || 'An error occurred during scraping.';
        errorDetails.value = data.errors || [];
        status.value = 'error';
        stopPolling();
        console.error('Search failed:', error.value, errorDetails.value);
      } else if (data.status === 'pending') {
        // Continue polling
        status.value = 'polling'; 
      } else {
        // Unexpected status
        throw new Error(`Unexpected status received: ${data.status}`);
      }
    } catch (err) {
      console.error('Polling failed:', err);
      error.value = err.message || 'Failed to get search results.';
      status.value = 'error';
      stopPolling();
    }
  }

  function startPolling() {
    stopPolling(); // Ensure no duplicate intervals
    if (searchId.value) {
        // Poll immediately first time
        pollResults(); 
        pollingInterval.value = setInterval(pollResults, pollFrequency);
    }
  }

  function stopPolling() {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value);
      pollingInterval.value = null;
    }
  }

  return {
    // State
    searchId,
    searchTerm,
    results,
    status,
    error,
    errorDetails,
    // Getters
    isLoading,
    hasError,
    isCompleted,
    // Actions
    initiateSearch,
    stopPolling // Expose stopPolling if needed externally
  };
}); 