export const AuthLogin = (redirect?: 'share' | 'default') => {
  const redirectUriMap: Record<string, string | undefined> = {
    default: import.meta.env.VITE_GOOGLE_O_AUTH_REDIRECT_URI,
    share: import.meta.env.VITE_GOOGLE_O_AUTH_REDIRECT_URL_SHARE,
  };

  const redirectUri = redirectUriMap[redirect ?? 'default'];

  if (!import.meta.env.VITE_GOOGLE_O_AUTH_CLIENT_ID || !redirectUri) {
    throw new Error('OAuth 정보가 없습니다.');
  }

  const params = {
    client_id: import.meta.env.VITE_GOOGLE_O_AUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email',
  };
  const queryString = new URLSearchParams(params).toString();
  const googleOAuthUrl = `${import.meta.env.VITE_GOOGLE_O_AUTH_REQUEST_URL}?${queryString}`;

  window.location.href = googleOAuthUrl;
};
