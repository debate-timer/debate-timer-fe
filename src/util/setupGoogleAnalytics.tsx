import ReactGA from 'react-ga4';

export function setupGoogleAnalytics(): void {
  const GA_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
  const isProduction = import.meta.env.MODE === 'production';

  if (!GA_ID || !isProduction) return;

  ReactGA.initialize(GA_ID);
  ReactGA.send('pageview');
}
