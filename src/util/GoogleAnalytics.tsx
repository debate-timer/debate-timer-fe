import { useEffect } from 'react';
import { useNavigationType, useLocation } from 'react-router-dom';

const GA_TRACKING_ID = 'G-5FT77BKMLW'; // GA4 ID

const GoogleAnalytics = () => {
  const navigationType = useNavigationType();
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', GA_TRACKING_ID, {
        page_path: location.pathname,
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }, [location, navigationType]);

  return null;
};

export default GoogleAnalytics;
