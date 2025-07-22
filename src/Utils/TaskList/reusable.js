  // Chunk 3: Progress Calculation Utilities
  export const calculateProgress = (completed, total) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };