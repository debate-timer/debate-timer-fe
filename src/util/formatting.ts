export const Formatting = {
  formatSecondsToMinutes: (time: number) => {
    const positiveTime = time >= 0 ? time : -time;
    const minutes = Math.floor(positiveTime / 60);
    const seconds = positiveTime % 60;
    return { minutes, seconds };
  },
  // Function that set all number to be have 2 digits (if time is 3, it will return 03)
  formatTwoDigits: (num: number): string => {
    return num.toString().padStart(2, '0');
  },
};
