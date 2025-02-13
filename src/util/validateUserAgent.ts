export const isEmbeddedWebView = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  // console.log(userAgent);

  return /fban|fbav|instagram|kakaotalk|line|wechat|snapchat|twitter/i.test(
    userAgent,
  );
};
