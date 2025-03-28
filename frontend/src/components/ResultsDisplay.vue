<template>
  <!-- Show content only after an initial search has yielded results -->
  <div v-if="results && results.length > 0" class="space-y-3">

    <!-- Controls Section (Filters & Sorting) - Always visible if initial results exist -->
    <div class="card p-3 mb-4 space-y-3">
      <!-- Filter by Store (Existing) -->
      <div v-if="uniqueStores.length > 1">
        <p class="text-xs font-medium text-zinc-400 mb-2">Filter by Store:</p>
        <div class="flex flex-wrap gap-2">
          <button
            @click="toggleAllStores"
            class="text-[10px] px-1.5 py-0.5 rounded border transition-colors"
            :class="allStoresSelected ? 'bg-orange-500/20 border-orange-500/30 text-orange-300' : 'bg-zinc-700/50 border-zinc-600/50 text-zinc-300 hover:bg-zinc-600/50'"
          >
            {{ allStoresSelected ? 'Deselect All' : 'Select All' }}
          </button>
          <label
            v-for="storeName in uniqueStores"
            :key="storeName"
            class="flex items-center space-x-1.5 px-2 py-1 rounded border cursor-pointer transition-colors text-[10px]"
            :class="selectedStores.has(storeName) ? 'bg-orange-500/20 border-orange-500/30 text-orange-300' : 'bg-zinc-700/50 border-zinc-600/50 text-zinc-300 hover:bg-zinc-600/50'"
          >
            <input
              type="checkbox"
              :value="storeName"
              :checked="selectedStores.has(storeName)"
              @change="toggleStore(storeName)"
              class="hidden"
            />
            <img
               v-if="getStoreLogo(storeName)"
               :src="getStoreLogo(storeName)"
               :alt="storeName"
               class="w-3 h-3 object-contain"
               @error="handleLogoError" />
            <span>{{ storeName }}</span>
          </label>
        </div>
      </div>

      <!-- Sort By -->
      <div>
        <label for="sort-by" class="block text-xs font-medium text-zinc-400 mb-1.5">Sort by:</label>
        <select
          id="sort-by"
          v-model="sortBy"
          class="w-full sm:w-auto bg-zinc-700/50 border border-zinc-600/50 rounded text-xs px-2 py-1 text-zinc-300 focus:ring-1 focus:ring-orange-500/40 focus:border-orange-500/40"
        >
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
          <option value="nameAsc">Name: A to Z</option> 
          <option value="nameDesc">Name: Z to A</option>
          <option value="offersDesc">Stores: Most to Fewest</option>
          <option value="offersAsc">Stores: Fewest to Most</option>
        </select>
      </div>

      <!-- Filter by Price Range -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label for="price-min" class="block text-xs font-medium text-zinc-400 mb-1.5">Min Price (€):</label>
            <input
              type="number"
              id="price-min"
              v-model.number="priceMin"
              min="0"
              step="0.01"
              placeholder="e.g., 10.00"
              class="w-full bg-zinc-700/50 border border-zinc-600/50 rounded text-xs px-2 py-1 text-zinc-300 placeholder:text-zinc-500 focus:ring-1 focus:ring-orange-500/40 focus:border-orange-500/40"
            />
          </div>
          <div>
            <label for="price-max" class="block text-xs font-medium text-zinc-400 mb-1.5">Max Price (€):</label>
            <input
              type="number"
              id="price-max"
              v-model.number="priceMax"
              min="0"
              step="0.01"
              placeholder="e.g., 50.00"
              class="w-full bg-zinc-700/50 border border-zinc-600/50 rounded text-xs px-2 py-1 text-zinc-300 placeholder:text-zinc-500 focus:ring-1 focus:ring-orange-500/40 focus:border-orange-500/40"
            />
          </div>
      </div>
    </div>

    <!-- Results Area -->
    <div v-if="processedResults && processedResults.length > 0">
      <!-- Results Loop -->
      <div v-for="(group, index) in processedResults" :key="group.name" 
           class="card animate-fadeIn" :style="{ animationDelay: `${index * 50}ms` }">
        
        <!-- Display for Groups with MULTIPLE offers -->
        <template v-if="group.offers.length > 1">
          <!-- Group Header -->
          <div class="flex items-start p-3 border-b border-zinc-700/20">
            <!-- Product Image -->
            <div class="relative w-12 h-12 flex-shrink-0 bg-zinc-900/70 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-800/50">
              <img
                v-if="group.image"
                :src="group.image"
                :alt="group.name"
                class="w-full h-full object-contain"
                @error="handleImageError($event, true)"
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
                <div class="flex items-baseline">
                  <span class="text-sm sm:text-base font-semibold text-orange-500">
                    {{ formatPrice(group.minPrice) }}€
                  </span>
                  <span v-if="group.maxPrice > group.minPrice" class="text-[10px] sm:text-xs text-zinc-400 ml-1">
                    - {{ formatPrice(group.maxPrice) }}€
                  </span>
                </div>
                <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-zinc-700/50 text-zinc-300 border border-zinc-600/20">
                  {{ group.offers.length }} {{ group.offers.length === 1 ? 'product' : 'products' }} in {{ group.uniqueStoreCount }} {{ group.uniqueStoreCount === 1 ? 'store' : 'stores' }}
                </span>
              </div>
            </div>

            <!-- Expand/Collapse Button -->
            <button
              @click="toggleGroup(group.name)"
              class="p-1 rounded-full bg-zinc-700/30 text-zinc-400 hover:bg-zinc-600/50 hover:text-zinc-200 transition-colors ml-1.5 mt-1 flex-shrink-0"
              :aria-label="expandedGroups[group.name] ? 'Collapse details' : 'Expand details'"
            >
              <svg
                class="w-3 h-3 transition-transform duration-200"
                :class="{ 'rotate-180': expandedGroups[group.name] }"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <!-- Expanded Store Offers -->
          <div v-if="expandedGroups[group.name]" class="divide-y divide-zinc-700/20">
            <OfferItem 
              v-for="offer in sortedOffers(group.offers)" 
              :key="offer.url" 
              :offer="offer" 
              @image-error="handleImageError"
            />
          </div>
        </template>

        <!-- Display for SINGLE offer -->
        <template v-else>
           <OfferItem 
              :offer="group.offers[0]" 
              :is-single="true"
              :group-name="group.name"
              :group-image="group.image"
              @image-error="handleImageError"
            />
        </template>
      </div>
    </div>
    
    <!-- No Results Found (after filtering/sorting) -->
    <div v-else class="flex flex-col items-center justify-center py-8 text-center">
      <div class="bg-zinc-800/30 rounded-full p-2 mb-2 border border-zinc-700/20">
        <svg class="w-5 h-5 text-zinc-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6.6C3 6.6 3 6.6 3 6.6C3 4.04772 5.04772 2 7.6 2C10.1523 2 12.2 4.04772 12.2 6.6V17.4C12.2 19.9523 10.1523 22 7.6 22C5.04772 22 3 19.9523 3 17.4V6.6Z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M12.2 6.6H21V17.4C21 19.9523 18.9523 22 16.4 22C13.8477 22 11.8 19.9523 11.8 17.4V6.6H12.2Z" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </div>
      <h3 class="text-sm font-medium text-zinc-100">No results for selected stores</h3>
      <p class="mt-1.5 text-[10px] sm:text-xs text-zinc-400 max-w-md">
        Try adjusting your store filters or search again.
      </p>
    </div>

  </div>
  
  <!-- No Results Found (initial empty search) -->
  <div v-else-if="results && results.length === 0" 
       class="flex flex-col items-center justify-center py-8 text-center">
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

  <!-- Optional: Placeholder before any search is done (results is null) -->
  <!-- <div v-else>
     Initial placeholder content if needed 
  </div> -->

</template>

<script setup>
import { ref, computed, watch } from 'vue';
import OfferItem from './OfferItem.vue'; // Assuming OfferItem is extracted

const props = defineProps({
  results: {
    type: Array,
    required: true
  }
});

const expandedGroups = ref({});
const selectedStores = ref(new Set());
const sortBy = ref('priceAsc'); // Add state for sorting
const priceMin = ref(null); // Add state for min price filter
const priceMax = ref(null); // Add state for max price filter

// --- Computed Properties ---
const uniqueStores = computed(() => {
  const stores = new Set();
  (props.results || []).forEach(group => {
    group.offers.forEach(offer => stores.add(offer.storeName));
  });
  return Array.from(stores).sort();
});

const allStoresSelected = computed(() => {
  return selectedStores.value.size === uniqueStores.value.length;
});

const storeLogoMap = computed(() => {
  const map = new Map();
  (props.results || []).forEach(group => {
    group.offers.forEach(offer => {
      if (offer.storeName && offer.storeLogo && !map.has(offer.storeName)) {
        map.set(offer.storeName, offer.storeLogo);
      }
    });
  });
  return map;
});

// Combined filtering and sorting logic
const processedResults = computed(() => {
  if (!props.results) return [];

  const min = typeof priceMin.value === 'number' ? priceMin.value : 0;
  const max = typeof priceMax.value === 'number' ? priceMax.value : Infinity;

  // 1. Filter by Store & Recalculate Group Stats
  const filteredAndRecalculated = props.results
    .map(group => {
      const filteredOffers = group.offers.filter(offer => selectedStores.value.has(offer.storeName));
      
      if (filteredOffers.length === 0) {
        return null; // Remove group if no offers match store filter
      }

      // Recalculate min/max price based on filtered offers
      let minPrice = Infinity;
      let maxPrice = 0;
      const uniqueStoreNames = new Set(); // Prepare to count unique stores
      filteredOffers.forEach(offer => {
        if (offer.price < minPrice) minPrice = offer.price;
        if (offer.price > maxPrice) maxPrice = offer.price;
        uniqueStoreNames.add(offer.storeName); // Add store name to set
      });
      // Handle cases where prices might be missing or invalid in offers
      minPrice = minPrice === Infinity ? 0 : minPrice; 

      return {
        ...group,
        offers: filteredOffers, // Use the filtered offers
        minPrice: minPrice,     // Use recalculated min price
        maxPrice: maxPrice,     // Use recalculated max price
        uniqueStoreCount: uniqueStoreNames.size // Add the count of unique stores
      };
    })
    .filter(group => group !== null); // Remove null entries

  // 2. Filter by Price Range (using recalculated prices)
  const priceFiltered = filteredAndRecalculated.filter(group => {
     // A group matches if its price range overlaps with the filter range.
     // Check if group's lowest price is within filter max AND group's highest price is within filter min
     const groupMin = group.minPrice ?? 0;
     const groupMax = group.maxPrice ?? groupMin; // Use min if max is 0 or undefined
     return groupMin <= max && groupMax >= min;
  });


  // 3. Sort the results
  return priceFiltered.sort((a, b) => {
    switch (sortBy.value) {
      case 'priceAsc':
        return (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity);
      case 'priceDesc':
        return (b.minPrice ?? 0) - (a.minPrice ?? 0);
      case 'nameAsc':
        return a.name.localeCompare(b.name);
      case 'nameDesc':
        return b.name.localeCompare(a.name);
      case 'offersDesc':
        return b.offers.length - a.offers.length;
      case 'offersAsc':
        return a.offers.length - b.offers.length;
      default:
        return 0; // Should not happen
    }
  });
});

// --- Watchers ---
// Initialize selected stores when results change
watch(() => props.results, (newResults) => {
  selectedStores.value = new Set(uniqueStores.value);
  expandedGroups.value = {}; // Reset expanded state
}, { immediate: true });

// --- Methods ---
const toggleGroup = (index) => {
  expandedGroups.value[index] = !expandedGroups.value[index];
};

const handleImageError = (event, isGroupImage = false) => {
  const target = event.target;
  if (target) {
    target.classList.add('hidden'); // Hide broken img
    const parent = target.parentElement;
    if (parent) {
       // Show placeholder if available (check needed, maybe pass placeholder svg as prop or use slot)
       parent.classList.remove('bg-zinc-900/70'); // Remove bg if img existed
       // We might need a more robust way to ensure the SVG placeholder shows
    }
  }
};
const handleLogoError = (event) => {
   const target = event.target;
    if (target) {
      target.style.display = 'none'; // Hide broken logo
    }
};

const formatPrice = (price) => {
  if (!price || isNaN(price)) return '0.00';
  return Number(price).toFixed(2);
};

const sortedOffers = (offers) => {
  return [...offers].sort((a, b) => a.price - b.price);
};

const toggleStore = (storeName) => {
  const newSet = new Set(selectedStores.value);
  if (newSet.has(storeName)) {
    newSet.delete(storeName);
  } else {
    newSet.add(storeName);
  }
  selectedStores.value = newSet;
};

const toggleAllStores = () => {
  if (allStoresSelected.value) {
    selectedStores.value = new Set();
  } else {
    selectedStores.value = new Set(uniqueStores.value);
  }
};

const getStoreLogo = (storeName) => {
  return storeLogoMap.value.get(storeName);
};
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Additional style for hidden image placeholder */
.img-placeholder svg {
  display: block; /* Ensure SVG shows when img is hidden */
}
</style> 