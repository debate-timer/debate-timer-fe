export const setAccessToken = (token: string): void => {
  localStorage.setItem('accessToken', token);
};
export const getAccessToken = () => {
  return Number(localStorage.getItem('accessToken'));
};

export const removeAccessToken = (): void => {
  localStorage.removeItem('accessToken');
};
