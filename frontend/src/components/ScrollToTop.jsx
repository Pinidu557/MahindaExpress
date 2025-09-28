import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// This component automatically scrolls the window to the top when the route changes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // This component doesn't render anything
}

export default ScrollToTop;
