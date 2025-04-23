/**
 * Utility function to properly escape JSX special characters in strings
 * @param text The text to escape
 * @returns Safely escaped text for JSX
 */
export const escapeJsx = (text: string): string => {
  return text
    .replace(/'/g, "&apos;")
    .replace(/"/g, "&quot;");
};

/**
 * HTML-escapes a string (< > & " ')
 * @param text The text to escape
 * @returns Safely escaped HTML text
 */
export const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}; 