import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { JotformAgent } from './components/JotformAgent';
import { useEffect, useState } from 'react';

/**
 * Component to conditionally render the Jotform Agent.
 * This component runs outside of the RouterProvider's context, so it must rely 
 * on lower-level browser APIs (window.location, popstate, and polling) 
 * to detect route changes and manually manage the Jotform DOM elements.
 */
function ConditionalJotformAgent() {
  const shouldShowAgent = () => {
    const pathname = window.location.pathname;
    // Hide agent on /tender-overview or any path starting with /categories
    return !(
      pathname === '/tender-overview' ||
      pathname.startsWith('/categories')
    );
  };

  const [showAgent, setShowAgent] = useState(shouldShowAgent);

  useEffect(() => {
    // Function to aggressively remove external Jotform DOM elements
    const hideJotformElements = () => {
      // Find the main container by its specific ID (replace with actual ID if different)
      const jotformContainer = document.getElementById(
        'JotformAgent-019aa102d4617a04838c7ef39132e1adea2b'
      );
      if (jotformContainer) jotformContainer.remove();

      // Aggressively target and remove other common Jotform elements 
      // injected outside the React root
      document.querySelectorAll(
        '[id*="Jotform"], [id*="jotform"], [class*="jotform"], [class*="agent-widget"]'
      ).forEach((el) => {
        // Use safer removal check
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    };

    const checkPath = () => {
      const show = shouldShowAgent();
      
      // Update state only if the condition has actually changed
      if (show !== showAgent) {
          setShowAgent(show);
      }

      // If we are hiding, immediately clean up the DOM
      if (!show) hideJotformElements();
    };

    // Initial check (Important for first load)
    checkPath();

    // 1. Listen for browser navigation (Back/Forward buttons)
    window.addEventListener('popstate', checkPath);

    // 2. Polling fallback to detect internal React Router navigations (like Link clicks)
    const interval = setInterval(checkPath, 500); // Check every 500ms

    // Cleanup function
    return () => {
      window.removeEventListener('popstate', checkPath);
      clearInterval(interval);
    };
  }, [showAgent]); // Dependency on showAgent keeps the checkPath closure up-to-date with state

  if (!showAgent) return null;

  return <JotformAgent />;
}

/**
 * Main application component.
 */
function App() {
  return (
    <>
      <RouterProvider router={router} />
      {/* Renders the conditional agent outside the RouterProvider tree */}
      <ConditionalJotformAgent />
    </>
  );
}

export default App;