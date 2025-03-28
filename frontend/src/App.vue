<script setup>
import { computed, onUnmounted, watch } from 'vue';
import SearchBar from './components/SearchBar.vue';
import ResultsDisplay from './components/ResultsDisplay.vue';
import LoadingSpinner from './components/LoadingSpinner.vue';
import ErrorMessage from './components/ErrorMessage.vue';
import { useSearchStore } from './stores/searchStore';

const store = useSearchStore();

const isLoading = computed(() => store.isLoading);
const isError = computed(() => store.isError);
const errorMessage = computed(() => store.errorMessage);
const searchResults = computed(() => store.results);

let pollInterval = null;

const performSearch = async (searchPayload) => {
  const { searchTerm, stores } = searchPayload;

  if (!searchTerm || !stores || stores.length === 0) {
    console.warn('Search term or selected stores missing in performSearch.');
    return;
  }

  if (pollInterval) {
    clearInterval(pollInterval);
  }
  await store.initiateSearch(searchTerm, stores);
};

// Watch for changes in searchId to start polling
watch(() => store.searchId, (newSearchId) => {
  if (newSearchId && store.searchStatus === 'PENDING') {
    if (pollInterval) clearInterval(pollInterval);
    
    // Start polling immediately
    store.pollResults(); 

    pollInterval = setInterval(async () => {
      await store.pollResults();
      // Stop polling if status is COMPLETED or FAILED
      if (store.searchStatus === 'COMPLETED' || store.searchStatus === 'FAILED') {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    }, 5000); // Poll every 5 seconds
  } else {
    // Clear interval if searchId is null or status is not PENDING
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }
}, { immediate: true }); // immediate: true to check on component mount

// Cleanup interval on component unmount
onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval);
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950">
    <!-- Header: Making it more modern with better transparency and blur -->
    <header class="sticky top-0 z-20 bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-800/50">
      <div class="max-w-5xl mx-auto px-4 py-3">
        <div class="flex items-center space-x-3">
          <!-- Logo: increased size -->
          <div class="flex-shrink-0 text-orange-500">
            <svg class="h-6 w-6 block" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" style="max-width: 100%; height: auto;">
              <rect x="1" y="5" width="18" height="14" rx="2" fill="currentColor" opacity="0.2"/>
              <path d="M1 7C1 5.89543 1.89543 5 3 5H17C18.1046 5 19 5.89543 19 7V17C19 18.1046 18.1046 19 17 19H3C1.89543 19 1 18.1046 1 17V7Z" stroke="currentColor" stroke-width="1.25"/>
              <path d="M8 1.5V5M12 1.5V5" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>
              <path d="M7 12L9 14L13 10" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          
          <!-- Title: increased size -->
          <div>
            <h1 class="text-lg font-semibold tracking-tight text-orange-500">BŪVSALĪDZINIS</h1>
            <p class="text-sm text-zinc-400">Building materials price comparison</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow pt-6 pb-10">
      <div class="max-w-5xl mx-auto px-4">
        <!-- Search Bar -->
        <SearchBar :disabled="isLoading" @search="performSearch" />

        <!-- Status Visualization -->
        <div class="mt-6">
          <!-- Loading Spinner -->
          <LoadingSpinner v-if="isLoading" />

          <!-- Error Message -->
          <ErrorMessage v-if="isError" :error="errorMessage" />

          <!-- Empty State -->
          <div v-if="!isLoading && !isError && (!searchResults || searchResults.length === 0)" 
               class="flex flex-col items-center py-8 text-center mt-6">
            <div class="bg-zinc-800/30 rounded-full p-3 mb-4 border border-zinc-700/30">
              <svg class="h-6 w-6 block text-zinc-500" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" style="max-width: 100%; height: auto; display: block;">
                <path d="M9 15C12.3137 15 15 12.3137 15 9C15 5.68629 12.3137 3 9 3C5.68629 3 3 5.68629 3 9C3 12.3137 5.68629 15 9 15Z" stroke="currentColor" stroke-width="1.25"/>
                <path d="M17 17L13 13" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>
              </svg>
            </div>
            <h2 class="text-lg font-medium mb-3 text-zinc-100">Search for building materials</h2>
            <p class="text-zinc-400 max-w-md text-sm">
              Enter a product name like "akmens vate", "cements", or "laminats" to find the best prices across multiple stores.
            </p>
          </div>

          <!-- Results -->
          <ResultsDisplay v-if="!isLoading && !isError && searchResults && searchResults.length > 0" :results="searchResults" />
        </div>
      </div>
    </main>

    <!-- Footer: increased size -->
    <footer class="bg-zinc-900/50 backdrop-blur-sm border-t border-zinc-800/30 py-3">
      <div class="max-w-5xl mx-auto px-4 flex justify-between items-center">
        <div class="text-sm text-zinc-500">
          © {{ new Date().getFullYear() }} Būvsalīdzinis
        </div>
        <div class="flex items-center space-x-6">
          <a href="#" class="text-zinc-500 hover:text-orange-500 transition-colors text-sm">About</a>
          <a href="#" class="text-zinc-500 hover:text-orange-500 transition-colors text-sm">Privacy</a>
          <a href="#" class="text-zinc-500 hover:text-orange-500 transition-colors text-sm">Contact</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
/* Ensure consistent global styles are applied from style.css */
</style>
