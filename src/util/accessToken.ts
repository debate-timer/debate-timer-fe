export const setAccessToken = (token: number): void => {
  sessionStorage.setItem('accessToken', token.toString());
};
export const getAccessToken = () => {
  return Number(sessionStorage.getItem('accessToken'));
};
