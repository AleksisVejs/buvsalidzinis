<template>
  <div v-if="results && results.length > 0" class="space-y-3">
    <div v-for="(group, index) in results" :key="index" 
         class="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/30 rounded-xl overflow-hidden shadow-sm">
      <!-- Group Header -->
      <div class="flex items-start p-3 border-b border-zinc-700/20">
        <!-- Product Image -->
        <div class="relative w-12 h-12 flex-shrink-0 bg-zinc-900/70 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-800/50">
          <img
            v-if="group.image"
            :src="group.image"
            :alt="group.name"
            class="w-full h-full object-contain"
            @error="handleImageError"
          />
          <svg v-else class="w-5 h-5 text-zinc-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/>
            <path d="M3 16L7 12L10 15L17 8L21 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <!-- Product Info -->
        <div class="ml-3 flex-grow min-w-0">
          <h3 class="text-zinc-100 font-medium line-clamp-2 text-xs sm:text-sm">
            {{ group.name }}
          </h3>
          
          <div class="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <!-- Price Range -->
            <div class="flex items-baseline">
              <span class="text-sm sm:text-base font-semibold text-orange-500">
                {{ formatPrice(group.minPrice) }}€
              </span>
              <span v-if="group.maxPrice > group.minPrice" class="text-[10px] sm:text-xs text-zinc-400 ml-1">
                - {{ formatPrice(group.maxPrice) }}€
              </span>
            </div>
            
            <!-- Store Count Badge -->
            <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-700/50 text-zinc-300 border border-zinc-600/20">
              {{ group.offers.length }} {{ group.offers.length === 1 ? 'store' : 'stores' }}
            </span>
          </div>
        </div>

        <!-- Expand/Collapse Button -->
        <button
          @click="toggleGroup(index)"
          class="p-1 rounded-full bg-zinc-700/30 text-zinc-400 hover:bg-zinc-600/50 hover:text-zinc-200 transition-colors ml-1.5 mt-1"
          :aria-label="expandedGroups[index] ? 'Collapse details' : 'Expand details'"
        >
          <svg
            class="w-3 h-3 transition-transform duration-200"
            :class="{ 'rotate-180': expandedGroups[index] }"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Expanded Store Offers -->
      <div v-if="expandedGroups[index]" class="divide-y divide-zinc-700/20">
        <div
          v-for="offer in sortedOffers(group.offers)"
          :key="offer.url"
          class="relative p-2.5 hover:bg-zinc-700/20 transition-colors"
        >
          <div class="flex items-center justify-between">
            <!-- Store Info -->
            <div class="flex items-center space-x-2 min-w-0">
              <div class="w-6 h-6 bg-zinc-900/70 rounded-md flex items-center justify-center overflow-hidden border border-zinc-800/50">
                <img
                  v-if="offer.storeLogo"
                  :src="offer.storeLogo"
                  :alt="offer.storeName"
                  class="w-full h-full object-contain"
                  @error="handleImageError"
                />
                <svg v-else class="w-3.5 h-3.5 text-zinc-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span class="text-[10px] sm:text-xs font-medium text-zinc-300 truncate">{{ offer.storeName }}</span>
            </div>
            
            <!-- Price and Action -->
            <div class="flex items-center space-x-2">
              <span class="text-xs sm:text-sm font-semibold text-orange-500">
                {{ formatPrice(offer.price) }}€
              </span>
              <a
                :href="offer.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center text-[10px] font-medium rounded-lg px-2 py-1 bg-zinc-700/70 text-zinc-300 hover:bg-zinc-600 hover:text-zinc-100 transition-colors"
              >
                View
                <svg class="w-2.5 h-2.5 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 5H8.2C7.0799 5 6.51984 5 6.09202 5.21799C5.71569 5.40973 5.40973 5.71569 5.21799 6.09202C5 6.51984 5 7.0799 5 8.2V15.8C5 16.9201 5 17.4802 5.21799 17.908C5.40973 18.2843 5.71569 18.5903 6.09202 18.782C6.51984 19 7.0799 19 8.2 19H15.8C16.9201 19 17.4802 19 17.908 18.782C18.2843 18.5903 18.5903 18.2843 18.782 17.908C19 17.4802 19 16.9201 19 15.8V14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 5H20M20 5V11M20 5L13 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="results && results.length === 0" class="flex flex-col items-center justify-center py-8 text-center">
    <div class="bg-zinc-800/30 rounded-full p-2 mb-2 border border-zinc-700/20">
      <svg class="w-5 h-5 text-zinc-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 14L12 12M12 12L14 10M12 12L10 10M12 12L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="1.5"/>
      </svg>
    </div>
    <h3 class="text-sm font-medium text-zinc-100">No results found</h3>
    <p class="mt-1.5 text-[10px] sm:text-xs text-zinc-400 max-w-md">
      We couldn't find any products matching your search. Try different keywords or check for spelling mistakes.
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  results: {
    type: Array,
    required: true
  }
});

const expandedGroups = ref({});

const toggleGroup = (index) => {
  expandedGroups.value[index] = !expandedGroups.value[index];
};

const handleImageError = (event) => {
  event.target.src = null; // Remove failed image to show placeholder
  event.target.classList.add('hidden'); // Hide the failed image
  event.target.parentElement.classList.add('bg-zinc-900/70'); // Add background to placeholder
};

const formatPrice = (price) => {
  if (!price || isNaN(price)) return '0.00';
  return Number(price).toFixed(2);
};

const sortedOffers = (offers) => {
  return [...offers].sort((a, b) => a.price - b.price);
};
</script>

<style scoped>
/* Optional: custom style for zinc-750 shade which doesn't exist in Tailwind by default */
.bg-zinc-750 {
  background-color: rgba(63, 63, 70, 1);
}
</style> 