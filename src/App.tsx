import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { JotformAgent } from './components/JotformAgent';
import { useEffect, useState } from 'react';

// Component to conditionally show Jotform agent on all pages except tender-overview
function ConditionalJotformAgent() {
  const [showAgent, setShowAgent] = useState(() => {
    return window.location.pathname !== '/tender-overview';
  });

  useEffect(() => {
    const hideJotformElements = () => {
      // Remove Jotform agent container
      const jotformContainer = document.getElementById('JotformAgent-019aa102d4617a04838c7ef39132e1adea2b');
      if (jotformContainer) {
        jotformContainer.remove();
      }
      // Remove any Jotform-related elements
      document.querySelectorAll('[id*="Jotform"], [id*="jotform"], [class*="jotform"], [class*="agent-widget"]').forEach((el) => {
        el.remove();
      });
    };

    const checkPath = () => {
      const pathname = window.location.pathname;
      const isTenderOverview = pathname === '/tender-overview';
      
      if (isTenderOverview) {
        // On tender-overview: hide agent and remove elements
        setShowAgent(false);
        hideJotformElements();
      } else {
        // On other pages: show agent
        setShowAgent(true);
      }
    };

    // Check immediately
    checkPath();

    // Listen for browser navigation (back/forward)
    window.addEventListener('popstate', checkPath);

    // Listen for React Router navigation by observing DOM changes
    const observer = new MutationObserver(() => {
      checkPath();
      // Also check for Jotform elements periodically on tender-overview
      if (window.location.pathname === '/tender-overview') {
        hideJotformElements();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Check periodically to ensure Jotform stays hidden on tender-overview
    const interval = setInterval(() => {
      checkPath();
      if (window.location.pathname === '/tender-overview') {
        hideJotformElements();
      }
    }, 200);

    return () => {
      window.removeEventListener('popstate', checkPath);
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  // Never render on tender-overview
  if (!showAgent || window.location.pathname === '/tender-overview') {
    return null;
  }

  return <JotformAgent />;
}

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ConditionalJotformAgent />
    </>
  );
}

export default App;
