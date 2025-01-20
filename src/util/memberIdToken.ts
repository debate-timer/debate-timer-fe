export const setMemberIdToken = (token: number): void => {
  sessionStorage.setItem('memberId', token.toString());
};
export const getMemberIdToken = () => {
  return Number(sessionStorage.getItem('memberId'));
};
