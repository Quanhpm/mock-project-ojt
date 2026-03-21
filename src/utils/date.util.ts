/**
 * Format ISO date string to Vietnamese date format
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "24/05/2024")
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Format ISO date string to Vietnamese datetime format
 * @param dateString - ISO date string
 * @returns Formatted datetime string (e.g., "24/05/2024 10:30")
 */
export const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};
