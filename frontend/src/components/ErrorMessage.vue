<template>
  <div class="bg-zinc-800/40 backdrop-blur-sm border border-red-900/30 rounded-xl overflow-hidden shadow-sm" role="alert">
    <div class="bg-red-500/10 px-3 py-2 flex items-center border-b border-red-900/20">
      <div class="p-0.5 rounded-full bg-red-500/20 mr-2 flex-shrink-0">
        <svg class="w-3 h-3 text-red-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M12 17.5V18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <span class="font-medium text-red-400 text-xs">Error:</span> 
      <span class="ml-1 text-zinc-300 text-xs">{{ errorMessage }}</span>
    </div>
    
    <div v-if="errorDetails" class="px-3 py-2 text-zinc-400 text-xs">
      <p class="font-medium text-[10px] uppercase text-zinc-500 mb-1">Details:</p>
      <pre class="whitespace-pre-wrap text-[10px] font-mono bg-zinc-900/40 p-2 rounded-lg border border-zinc-800/40">{{ errorDetailsText }}</pre>
      
      <div class="mt-2 flex justify-end">
        <button 
          class="px-2 py-1 bg-zinc-700/70 hover:bg-zinc-600 text-zinc-300 text-[10px] font-medium rounded-lg transition-colors flex items-center"
          @click="$emit('retry')"
        >
          <svg class="w-2.5 h-2.5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 10C2 10 4.00498 7.26822 5 6C8.5 2 11 2 13.5 2C16 2 19 4 19 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 14C22 14 19.995 16.7318 19 18C15.5 22 13 22 10.5 22C8 22 5 20 5 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20 4L19 8L15 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4 20L5 16L9 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Try Again
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  error: {
    type: [String, Object], // Can be a simple message or an error object
    required: true
  }
});

defineEmits(['retry']);

const errorMessage = computed(() => {
  if (typeof props.error === 'string') {
    return props.error;
  } else if (props.error instanceof Error) {
    return props.error.message || 'An unknown error occurred.';
  } else if (props.error && typeof props.error === 'object' && props.error.message) {
    return props.error.message;
  }
  return 'An unexpected error occurred.';
});

const errorDetails = computed(() => {
  if (props.error && typeof props.error === 'object') {
    // Extract details, could be status, statusText, or other properties
    return props.error.details || props.error.statusText || props.error.status || props.error.stack;
  }
  return null;
});

const errorDetailsText = computed(() => {
  if (!errorDetails.value) return '';
  if (typeof errorDetails.value === 'string') {
    return errorDetails.value;
  }
  // Attempt to stringify if it's an object, for better display
  try {
    return JSON.stringify(errorDetails.value, null, 2);
  } catch {
    return 'Could not display error details.';
  }
});
</script>

<style scoped>
/* Add component-specific styles if needed */
</style> 