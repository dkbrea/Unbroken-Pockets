// Avoid importing globals.css to prevent style conflicts with the landing page
// Only import globals.css for pages that need it
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import '../styles/globals.css'; // Import CSS but disable it conditionally for landing page

export default function App({ Component, pageProps }) {
  const router = useRouter();
  
  // Only apply global styles to pages other than the landing page
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Create a style element for global styles if it doesn't exist
      let existingGlobalStyles = document.getElementById('global-styles');
      if (!existingGlobalStyles) {
        existingGlobalStyles = document.createElement('style');
        existingGlobalStyles.id = 'global-styles';
        document.head.appendChild(existingGlobalStyles);
      }
      
      // Remove any conflicting styles when on landing page
      if (router.pathname === '/') {
        existingGlobalStyles.disabled = true;
      } else {
        existingGlobalStyles.disabled = false;
      }
    }
  }, [router.pathname]);
  
  return <Component {...pageProps} />;
} 