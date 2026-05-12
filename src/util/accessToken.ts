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

export const setMemberId = (id: number): void => {
  localStorage.setItem('memberId', String(id));
};

export const getMemberId = (): string | null => {
  return localStorage.getItem('memberId');
};

export const removeMemberId = (): void => {
  localStorage.removeItem('memberId');
};
