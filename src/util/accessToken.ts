export const setAccessToken = (token: string): void => {
  localStorage.setItem('accessToken', token);
};

export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

export const removeAccessToken = (): void => {
  localStorage.removeItem('accessToken');
};

export const isLoggedIn = (): boolean => {
  return !!getAccessToken();
};
