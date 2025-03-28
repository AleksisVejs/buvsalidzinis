const { v4: uuidv4 } = require('uuid');

/**
 * Normalizes a product name for comparison.
 * - Converts to lowercase
 * - Trims whitespace
 * - Removes common punctuation (.,-()/)
 * - Optionally remove common units or dimension indicators (mm, cm, kg, l)
 * @param {string} name The original product name.
 * @returns {string} The normalized product name.
 */
function normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    // Remove punctuation
    .replace(/[.,\-()/]/g, ' ') 
    // Optional: remove units - be careful not to remove parts of actual names
    // .replace(/\b(mm|cm|m|kg|g|l|ml)\b/g, ' ')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Groups products based on a normalized name matching strategy.
 * @param {Array<object>} allResults Flat array of product objects from all scrapers.
 * @returns {Array<object>} Array of grouped products.
 *          Each group: { groupId: string, name: string, image: string, offers: Array<object> }
 */
function groupProducts(allResults) {
  if (!allResults || allResults.length === 0) {
    return [];
  }

  const groups = [];
  const groupMap = new Map(); // Map normalizedName -> groupIndex

  allResults.forEach(product => {
    if (!product || !product.name) {
      console.warn('Skipping product with missing name:', product);
      return; // Skip products without names
    }

    const normalized = normalizeName(product.name);

    if (groupMap.has(normalized)) {
      // Add to existing group
      const groupIndex = groupMap.get(normalized);
      groups[groupIndex].offers.push(product);
      // Optional: Refine representative name if needed (e.g., choose shortest/longest)
    } else {
      // Create a new group
      const newGroup = {
        groupId: uuidv4(),
        name: product.name, // Use the first product's original name (RENAMED from representativeName)
        image: product.image || null, // Use the first product's image as representative
        normalizedName: normalized, // Store for potential future use
        offers: [product],
      };
      groups.push(newGroup);
      groupMap.set(normalized, groups.length - 1);
    }
  });

  // Clean up: sort offers within groups by price (ascending)
  // Also ensure the main group image is updated if the first offer changes after sorting
  groups.forEach(group => {
    group.offers.sort((a, b) => (a.price || Infinity) - (b.price || Infinity));
    // Update representative image based on the (potentially new) first offer after sorting
    if (group.offers.length > 0) {
      group.image = group.offers[0].image || null;
    } else {
      group.image = null; // Handle case of empty offers array? Should not happen based on logic above.
    }
    // Optional: Remove the temporary normalizedName field if not needed in output
    // delete group.normalizedName;
  });

  // Optional: Sort groups themselves (e.g., by number of offers, representative name)
  groups.sort((a, b) => a.name.localeCompare(b.name)); // Use renamed 'name' field

  console.log(`Grouped ${allResults.length} products into ${groups.length} groups.`);

  // --- Placeholder for Advanced Strategies ---
  // TODO: Integrate fuzzy matching (e.g., using fuse.js) for similar names.
  // TODO: Consider matching based on product identifiers (EAN, MPN) if available.
  // TODO: Implement attribute comparison for more robust grouping.
  // --- End Placeholder ---

  return groups;
}

module.exports = { groupProducts, normalizeName }; 