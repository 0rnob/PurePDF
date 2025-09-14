/**
 * Parses a page range string (e.g., "1, 3-5, 8") into an array of 0-based page indices.
 * @param rangeString The string to parse.
 * @returns An array of numbers representing the 0-based indices.
 * @throws An error if the format is invalid.
 */
export const parsePageRanges = (rangeString: string): number[] => {
  const indices = new Set<number>();
  
  if (!rangeString.trim()) {
    return [];
  }

  // Basic validation for allowed characters
  if (!/^[0-9,\-\s]+$/.test(rangeString)) {
    throw new Error("Invalid characters in page range. Only numbers, commas, and hyphens are allowed.");
  }

  const parts = rangeString.split(',');

  for (const part of parts) {
    const trimmedPart = part.trim();
    if (!trimmedPart) continue;

    if (trimmedPart.includes('-')) {
      const rangeParts = trimmedPart.split('-');
      if (rangeParts.length !== 2) throw new Error(`Invalid range format: "${trimmedPart}"`);
      
      const start = parseInt(rangeParts[0], 10);
      const end = parseInt(rangeParts[1], 10);
      
      if (isNaN(start) || isNaN(end) || start <= 0 || end <= 0 || start > end) {
        throw new Error(`Invalid page range: "${trimmedPart}". Start must be less than or equal to end, and pages must be positive numbers.`);
      }

      for (let i = start; i <= end; i++) {
        indices.add(i - 1); // convert to 0-based index
      }
    } else {
      const pageNum = parseInt(trimmedPart, 10);
      if (isNaN(pageNum) || pageNum <= 0) {
        throw new Error(`Invalid page number: "${trimmedPart}". Pages must be positive numbers.`);
      }
      indices.add(pageNum - 1); // convert to 0-based index
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
};
