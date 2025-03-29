<template>
  <div class="rounded-xl overflow-hidden backdrop-blur-sm bg-zinc-800/30 border border-zinc-700/30 shadow-lg">
    <form @submit.prevent="submitSearch" class="p-3">
      <div class="relative">
        <!-- Search icon -->
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="w-4 h-4 block" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" style="max-width: 100%; height: auto;">
            <path d="M10.5303 10.5407L14 14M12 7C12 9.76142 9.76142 12 7 12C4.23858 12 2 9.76142 2 7C2 4.23858 4.23858 2 7 2C9.76142 2 12 4.23858 12 7Z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <!-- Search input -->
        <input 
          type="text"
          v-model="searchTerm"
          placeholder="Search for building materials (e.g., 'akmens vate', 'cements')"
          class="w-full pl-10 pr-10 py-2.5 bg-transparent border-none focus:ring-1 focus:ring-orange-500/40 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500"
          :disabled="disabled"
          @input="debouncedHandleInput"
          @focus="showSuggestions = true"
          @keyup.enter="submitSearch"
          required
        />
        
        <!-- Clear button -->
        <button 
          v-if="searchTerm"
          type="button"
          class="absolute inset-y-0 right-0 pr-3 flex items-center"
          @click="clearSearch"
        >
          <svg class="w-4 h-4 block" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" style="max-width: 100%; height: auto;">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <!-- Recent Searches Dropdown -->
        <div 
          v-if="showSuggestions && recentSearches.length > 0" 
          class="absolute z-50 w-full top-full mt-1 bg-zinc-800/90 border border-zinc-700/30 rounded-lg shadow-xl"
        >
          <div class="p-2 border-b border-zinc-700/20 flex justify-between items-center">
            <span class="text-sm font-medium text-zinc-400">Recent Searches</span>
            <button 
              @click.stop="clearRecentSearches"
              :disabled="!hasRecentSearches"
              class="text-sm text-zinc-500 hover:text-orange-500 transition-colors"
            >
              Clear All
            </button>
          </div>
          <ul class="max-h-48 overflow-y-auto">
            <li 
              v-for="search in recentSearches" 
              :key="search"
              class="px-3 py-2 hover:bg-zinc-700/40 cursor-pointer flex justify-between items-center border-b border-zinc-700/10 last:border-0 transition-colors"
              @click="selectRecentSearch(search)"
            >
              <div class="flex items-center">
                <svg class="w-4 h-4 block text-zinc-500 mr-2" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" style="max-width: 100%; height: auto;">
                  <path d="M8 6V8L10 10M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="text-zinc-300 text-sm">{{ search }}</span>
              </div>
              <button 
                @click.stop="removeRecentSearch(search)"
                class="text-zinc-500 hover:text-red-500 transition-colors"
              >
                <svg class="w-4 h-4 block" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" style="max-width: 100%; height: auto;">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Store Selection Checkboxes -->
      <div class="mt-4 space-y-2">
        <label class="block text-xs font-medium text-zinc-400 mb-1.5">Search in stores:</label>
        <div class="flex flex-wrap gap-x-4 gap-y-2">
          <div v-for="store in availableStores" :key="store.name" class="flex items-center">
            <input
              :id="'store-' + store.name"
              type="checkbox"
              v-model="store.selected"
              class="h-4 w-4 rounded border-zinc-600 bg-zinc-900/50 text-orange-500 focus:ring-orange-500/50 focus:ring-offset-zinc-900 cursor-pointer"
            >
            <label :for="'store-' + store.name" class="ml-2 text-sm text-zinc-300 cursor-pointer">{{ store.name }}</label>
          </div>
        </div>
      </div>
      <!-- End Store Selection -->

      <div class="mt-4 flex justify-end">
        <button 
          type="submit"
          :disabled="disabled || !searchTerm.trim()"
          class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg text-sm flex items-center shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!disabled" class="flex items-center">
            <svg class="w-4 h-4 block mr-1.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" style="max-width: 100%; height: auto;">
              <path d="M10.5303 10.5407L14 14M12 7C12 9.76142 9.76142 12 7 12C4.23858 12 2 9.76142 2 7C2 4.23858 4.23858 2 7 2C9.76142 2 12 4.23858 12 7Z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Search
          </span>
          <span v-else class="flex items-center">
            <svg class="w-4 h-4 block mr-1.5 animate-spin" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" style="max-width: 100%; height: auto;">
              <path d="M8 2V4M8 12V14M4 8H2M14 8H12M12.7189 12.7189L10.8333 10.8333M12.7189 3.28107L10.8333 5.16667M3.28107 12.7189L5.16667 10.8333M3.28107 3.28107L5.16667 5.16667" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Searching...
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const MAX_RECENT_SEARCHES = 5;
const RECENT_SEARCHES_KEY = 'buvsalidzinis_recent_searches';

// Define available stores
const availableStores = ref([
  { name: 'Depo', selected: true },
  { name: 'Ksenukai', selected: true },
  // Add more stores here in the future
]);

const props = defineProps({
  disabled: Boolean
});

const emit = defineEmits(['search']);
const searchTerm = ref('');
const showSuggestions = ref(false);
const recentSearches = ref([]);

// Load recent searches from localStorage
onMounted(() => {
  const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
  if (saved) {
    recentSearches.value = JSON.parse(saved);
  }
});

const hasRecentSearches = computed(() => recentSearches.value.length > 0);

// Debounced input handler (for future autocomplete feature)
let debounceTimeout;
const debouncedHandleInput = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    // Placeholder for future autocomplete functionality
  }, 300);
};

const saveRecentSearches = () => {
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches.value));
};

const addToRecentSearches = (term) => {
  const normalizedTerm = term.trim().toLowerCase();
  recentSearches.value = [
    normalizedTerm,
    ...recentSearches.value.filter(t => t !== normalizedTerm)
  ].slice(0, MAX_RECENT_SEARCHES);
  saveRecentSearches();
};

const removeRecentSearch = (term) => {
  recentSearches.value = recentSearches.value.filter(t => t !== term);
  saveRecentSearches();
};

const clearRecentSearches = () => {
  recentSearches.value = [];
  localStorage.removeItem(RECENT_SEARCHES_KEY);
};

const selectRecentSearch = (term) => {
  searchTerm.value = term;
  showSuggestions.value = false;
  submitSearch();
};

const clearSearch = () => {
  searchTerm.value = '';
  showSuggestions.value = false;
  // Reset store selection if needed, or keep user's preference
  // availableStores.value.forEach(store => store.selected = true); 
};

const submitSearch = () => {
  const term = searchTerm.value.trim();
  const selectedStoreNames = availableStores.value
    .filter(store => store.selected)
    .map(store => store.name);

  // Basic validation: Ensure a term is entered and at least one store is selected
  if (!term) {
    console.warn("Search term is empty.");
    // Optionally: Add user feedback (e.g., focus input, show message)
    return;
  }
  if (selectedStoreNames.length === 0) {
    console.warn("No stores selected for search.");
    // Optionally: Add user feedback
    return;
  }

  if (term) {
    addToRecentSearches(term);
    // Emit an object with searchTerm and selected stores
    emit('search', { searchTerm: term, stores: selectedStoreNames }); 
    showSuggestions.value = false;
  }
};

// Close suggestions when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('form')) {
    showSuggestions.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
</style> 