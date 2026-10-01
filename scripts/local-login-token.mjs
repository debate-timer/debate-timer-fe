#!/usr/bin/env node
// 로컬 BE(local 프로필, H2 메모리 DB)에서 Google OAuth 없이 로그인하기 위한 도구입니다.
// 1. H2 콘솔로 테스트 회원을 넣고 (이미 있으면 건너뜀)
// 2. local 프로필의 JWT secret으로 ACCESS_TOKEN을 서명해 출력합니다.
//
// 사용: node scripts/local-login-token.mjs [email]
// 환경 변수:
//   LOCAL_API_BASE_URL (기본 http://localhost:8080)
//   LOCAL_JWT_SECRET   (기본값은 BE application-local.yml의 jwt.secret_key)
//   LOCAL_TOKEN_TTL_SECONDS (기본 86400)
import { createHmac } from 'node:crypto';

const email = process.argv[2] ?? 'local-tester@debate.local';
const baseUrl = process.env.LOCAL_API_BASE_URL ?? 'http://localhost:8080';
const secret =
  process.env.LOCAL_JWT_SECRET ?? 'lnklbdsxjfhruyfidjgjgrjfjfjhfhhh';
const ttlSeconds = Number(process.env.LOCAL_TOKEN_TTL_SECONDS ?? 86400);

function base64Url(value) {
  return Buffer.from(value).toString('base64url');
}

function signAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'HS256' }));
  const payload = base64Url(
    JSON.stringify({
      sub: email,
      iat: now,
      exp: now + ttlSeconds,
      type: 'ACCESS_TOKEN',
    }),
  );
  const signature = createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${signature}`;
}

async function runH2Query(sessionId, sql) {
  const response = await fetch(
    `${baseUrl}/h2-console/query.do?jsessionid=${sessionId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ sql }),
    },
  );
  return response.text();
}

async function ensureMember() {
  const entry = await fetch(`${baseUrl}/h2-console/`).then((res) => res.text());
  const sessionId = entry.match(/jsessionid=([a-z0-9]+)/)?.[1];
  if (!sessionId) {
    throw new Error(
      'H2 콘솔 세션을 만들지 못했습니다. BE가 local 프로필로 실행 중인지 확인하세요.',
    );
  }

  await fetch(`${baseUrl}/h2-console/login.do?jsessionid=${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      driver: 'org.h2.Driver',
      url: 'jdbc:h2:mem:database',
      user: 'sa',
      password: '',
    }),
  });

  const escapedEmail = email.replaceAll("'", "''");
  await runH2Query(
    sessionId,
    `MERGE INTO MEMBER (EMAIL, CREATED_AT, MODIFIED_AT) KEY (EMAIL) VALUES ('${escapedEmail}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
  );
  const result = await runH2Query(
    sessionId,
    `SELECT ID FROM MEMBER WHERE EMAIL = '${escapedEmail}'`,
  );
  const memberId = result.replace(/<[^>]*>/g, ' ').match(/\bID\s+(\d+)/)?.[1];
  if (!memberId) {
    throw new Error('회원 ID를 조회하지 못했습니다.');
  }
  return memberId;
}

const memberId = await ensureMember();
const accessToken = signAccessToken();

const check = await fetch(`${baseUrl}/api/table`, {
  headers: { Authorization: accessToken },
});
if (!check.ok) {
  throw new Error(`발급한 토큰 검증 실패: GET /api/table → ${check.status}`);
}

console.log(`email: ${email}`);
console.log(`memberId: ${memberId}`);
console.log(`accessToken: ${accessToken}`);
console.log('');
console.log('브라우저(http://localhost:3000) 개발자 도구 콘솔에 붙여넣기:');
console.log(
  `localStorage.setItem('accessToken', '${accessToken}'); localStorage.setItem('memberId', '${memberId}'); location.reload();`,
);
