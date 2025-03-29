// Function that makes URLs that is going to be used to call APIs
function makeUrl(endpoint: string): string {
  // return BASE_URL + endpoint;
  return '/api' + endpoint;
}

// URL 테이블
export const ApiUrl = {
  member: makeUrl('/member'),
  table: makeUrl('/table'),
  parliamentary: makeUrl('/table/parliamentary'),
  customize: makeUrl('/table/customize'),
};
