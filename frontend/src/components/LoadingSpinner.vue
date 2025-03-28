<template>
  <div class="flex flex-col items-center justify-center py-6">
    <div class="relative">
      <!-- Modern spinner with construction theme -->
      <div class="relative h-14 w-14 flex items-center justify-center">
        <!-- Outer ring -->
        <div class="absolute inset-0 border-[1.5px] border-zinc-700/30 rounded-full"></div>
        
        <!-- Spinning segment -->
        <div class="absolute inset-0 border-t-[1.5px] border-orange-500/80 rounded-full animate-spin" style="animation-duration: 0.8s;"></div>
        
        <!-- Inner icon -->
        <svg class="w-5 h-5 text-orange-500/70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 6V4M12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 12L12 12L12 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M5 20H19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      
      <!-- Progress dots -->
      <div class="flex mt-2 space-x-1 justify-center">
        <div class="w-1 h-1 bg-orange-500/60 rounded-full animate-pulse" style="animation-delay: 0ms;"></div>
        <div class="w-1 h-1 bg-orange-500/60 rounded-full animate-pulse" style="animation-delay: 300ms;"></div>
        <div class="w-1 h-1 bg-orange-500/60 rounded-full animate-pulse" style="animation-delay: 600ms;"></div>
      </div>
    </div>
    
    <p class="mt-3 text-xs font-medium text-zinc-300">Finding best prices</p>
    <p class="mt-0.5 text-[10px] text-zinc-500">This will take just a moment</p>
  </div>
</template>

<script setup>
// No script logic needed
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 2s linear infinite;
}
</style> 