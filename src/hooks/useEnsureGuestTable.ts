import { useState } from 'react';
import { SAMPLE_TABLE_DATA } from '../constants/sample_table';
import {
  isGuestFlow,
  setSessionCustomizeTableData,
} from '../util/sessionStorage';

export const GUEST_TABLE_ID = 'guest';

/**
 * 게스트 경로(`/:id === 'guest'`)인데 세션에 테이블 데이터가 없으면
 * 샘플 테이블을 세션에 채워 게스트 플로우를 복구한다.
 *
 * 홈 버튼으로 세션이 비워진 뒤 뒤로가기로 돌아오면 게스트 판별이 풀려
 * API 저장소로 `Number('guest')`(NaN) 조회가 나가므로, 쿼리가 저장소를
 * 고르기 전에 동기적으로 실행되도록 useState 초기화 함수에서 처리한다.
 */
export function useEnsureGuestTable(id: string | undefined) {
  useState(() => {
    if (id === GUEST_TABLE_ID && !isGuestFlow()) {
      setSessionCustomizeTableData(SAMPLE_TABLE_DATA);
    }
    return null;
  });
}
