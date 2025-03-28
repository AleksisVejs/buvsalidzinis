<template>
  <div :class="isSingle ? 'flex items-start p-3' : 'relative p-2.5 hover:bg-zinc-700/20 transition-colors'">
    
    <!-- Product Image (Only for single view) -->
    <div v-if="isSingle" class="relative w-12 h-12 flex-shrink-0 bg-zinc-900/70 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-800/50 mr-3">
      <img
        v-if="groupImage"
        :src="groupImage"
        :alt="groupName"
        class="w-full h-full object-contain"
        @error="$emit('image-error', $event, true)"
      />
      <svg v-else class="w-5 h-5 text-zinc-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/>
        <path d="M3 16L7 12L10 15L17 8L21 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <div class="flex-grow flex items-center justify-between min-w-0">
      <!-- Store & Product Info -->
      <div class="flex items-center space-x-2 min-w-0">
        <!-- Store Logo -->
        <div class="w-6 h-6 bg-zinc-900/70 rounded-md flex items-center justify-center overflow-hidden border border-zinc-800/50 flex-shrink-0">
          <img
            v-if="offer.storeLogo"
            :src="offer.storeLogo"
            :alt="offer.storeName"
            class="w-full h-full object-contain"
            @error="$emit('image-error', $event, false)"
          />
          <svg v-else class="w-3.5 h-3.5 text-zinc-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="min-w-0">
          <!-- Product Name (Only for single view) -->
          <h3 v-if="isSingle" class="text-zinc-100 font-medium line-clamp-2 text-xs sm:text-sm truncate mb-0.5">
            {{ groupName }}
          </h3>
          <!-- Store Name -->
          <span class="text-[10px] sm:text-xs font-medium text-zinc-300 truncate block">{{ offer.storeName }}</span>
        </div>
      </div>
      
      <!-- Price and Action -->
      <div class="flex items-center space-x-2 flex-shrink-0 ml-2">
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
</template>

<script setup>
const props = defineProps({
  offer: {
    type: Object,
    required: true
  },
  isSingle: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    default: ''
  },
  groupImage: {
    type: String,
    default: ''
  }
});

defineEmits(['image-error']);

const formatPrice = (price) => {
  if (!price || isNaN(price)) return '0.00';
  return Number(price).toFixed(2);
};
</script> 