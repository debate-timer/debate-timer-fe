export const Formatting = {
  formatSecondsToMinutes: (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}분 ${seconds}초`;
  },
};
