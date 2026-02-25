export const oAuthLogin = () => {
  if (
    !import.meta.env.VITE_GOOGLE_O_AUTH_CLIENT_ID ||
    !import.meta.env.VITE_GOOGLE_O_AUTH_REDIRECT_URI ||
    !import.meta.env.VITE_GOOGLE_O_AUTH_REQUEST_URL
  ) {
    throw new Error('OAuth 정보가 없습니다.');
  }

  const params: Record<string, string> = {
    client_id: import.meta.env.VITE_GOOGLE_O_AUTH_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_GOOGLE_O_AUTH_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid profile email',
  };

  const basePath = import.meta.env.VITE_BASE_PATH;
  if (basePath && basePath !== '/') {
    params.state = basePath;
  }

  const queryString = new URLSearchParams(params).toString();
  const googleOAuthUrl = `${import.meta.env.VITE_GOOGLE_O_AUTH_REQUEST_URL}?${queryString}`;

  window.location.href = googleOAuthUrl;
};
