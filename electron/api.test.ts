import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { getItem, getAllItems, deleteItem, patchItem, postItem } from './api';
import { DebateTableData } from './type';

// --- 테스트 환경 설정 ---
const TEST_DIR = path.join(os.tmpdir(), 'electron-db-test');
const testDbPath = path.join(TEST_DIR, 'test-db.json');
const ORIGINAL_SAMPLE_DATA: DebateTableData = {
  info: {
    id: '1-1-1-1-1',
    agenda: '나의 토론 주제',
    name: '나의 시간표',
    prosTeamName: '찬성',
    consTeamName: '반대',
    finishBell: true,
    warningBell: false,
  },
  table: [
    {
      boxType: 'NORMAL',
      stance: 'PROS',
      speechType: '입론',
      time: 180,
      timePerSpeaking: null,
      timePerTeam: null,
      speaker: '1번',
    },
    {
      boxType: 'NORMAL',
      stance: 'CONS',
      speechType: '입론',
      time: 180,
      timePerSpeaking: null,
      timePerTeam: null,
      speaker: '1번',
    },
    {
      boxType: 'NORMAL',
      stance: 'PROS',
      speechType: '반론',
      time: 180,
      timePerSpeaking: null,
      timePerTeam: null,
      speaker: '2번',
    },
    {
      boxType: 'NORMAL',
      stance: 'CONS',
      speechType: '반론',
      time: 180,
      timePerSpeaking: null,
      timePerTeam: null,
      speaker: '2번',
    },
    {
      boxType: 'TIME_BASED',
      stance: 'NEUTRAL',
      speechType: '자유토론',
      time: null,
      timePerSpeaking: 120,
      timePerTeam: 420,
      speaker: '2번',
    },
    {
      boxType: 'NORMAL',
      stance: 'PROS',
      speechType: '최종 발언',
      time: 180,
      timePerSpeaking: null,
      timePerTeam: null,
      speaker: '3번',
    },
    {
      boxType: 'NORMAL',
      stance: 'CONS',
      speechType: '최종 발언',
      time: 180,
      timePerSpeaking: null,
      timePerTeam: null,
      speaker: '3번',
    },
  ],
} as const;
const SAMPLE_UUID_1 = '79800bb7-70a1-4564-b790-e2148967af7e';
const SAMPLE_UUID_2 = 'bd818b12-fbb0-405a-8fab-d22d63884e82';

// 테스트용 초기 데이터 (Seed Data)
let SEED_DATA: DebateTableData[];

beforeAll(async () => {
  // 테스트를 위한 임시 디렉토리 생성
  await fs.mkdir(TEST_DIR, { recursive: true });
});

beforeEach(async () => {
  // 각 테스트가 실행되기 전에 항상 동일한 초기 데이터로 파일을 덮어씀
  const SAMPLE_DATA_1 = JSON.parse(JSON.stringify(ORIGINAL_SAMPLE_DATA));
  const SAMPLE_DATA_2 = JSON.parse(JSON.stringify(ORIGINAL_SAMPLE_DATA));
  SAMPLE_DATA_1.info.id = SAMPLE_UUID_1;
  SAMPLE_DATA_2.info.id = SAMPLE_UUID_2;
  SEED_DATA = [SAMPLE_DATA_1, SAMPLE_DATA_2];
  await fs.writeFile(testDbPath, JSON.stringify(SEED_DATA, null, 2));
});

afterAll(async () => {
  // 모든 테스트가 끝난 후 임시 디렉토리와 파일 삭제
  await fs.rm(TEST_DIR, { recursive: true, force: true });
});

// --- 테스트 스위트 ---
describe('Database Handlers', () => {
  it('✅ getAllItems: should return all items from the database', async () => {
    const items = await getAllItems(testDbPath);
    expect(items).toHaveLength(2);
    expect(items).toEqual(SEED_DATA);
  });

  describe('getItem', () => {
    it('✅ should return a single item for a valid ID', async () => {
      const item = await getItem(testDbPath, SAMPLE_UUID_1);
      expect(item.info.id).toBe(SAMPLE_UUID_1);
      expect(item.info.agenda).toBe('나의 토론 주제');
    });

    it('❌ should throw an error for a non-existent ID', async () => {
      // 존재하지 않는 ID로 요청했을 때 에러가 발생하는지 확인
      await expect(getItem(testDbPath, '9-2-3-1-2')).rejects.toThrow(
        'Failed to find item.',
      );
    });
  });

  it('✅ postItem: should add a new item and return it', async () => {
    const newItem = JSON.parse(JSON.stringify(ORIGINAL_SAMPLE_DATA));

    const createdItem = await postItem(testDbPath, newItem as DebateTableData);

    expect(createdItem.info.agenda).toBe('나의 토론 주제');
    expect(createdItem.info.id).toBeDefined(); // 새 UUID가 할당되었는지 확인

    // 파일의 실제 상태도 확인
    const db = JSON.parse(await fs.readFile(testDbPath, 'utf-8'));
    expect(db).toHaveLength(3);
    expect(db[2].info.agenda).toBe('나의 토론 주제');
  });

  it('✅ deleteItem: should remove an item and return the updated list', async () => {
    const updatedDb = await deleteItem(testDbPath, SAMPLE_UUID_1);

    expect(updatedDb).toHaveLength(1);
    expect(
      updatedDb.find((item) => item.info.id === SAMPLE_UUID_1),
    ).toBeUndefined();

    // 파일의 실제 상태도 확인
    const db = JSON.parse(await fs.readFile(testDbPath, 'utf-8'));
    expect(db).toHaveLength(1);
  });

  it('✅ patchItem: should update an existing item and return it', async () => {
    const itemToUpdate = JSON.parse(JSON.stringify(ORIGINAL_SAMPLE_DATA));
    itemToUpdate.info.id = SAMPLE_UUID_1;
    itemToUpdate.info.agenda = '새로운 토론 주제';

    const updatedItem = await patchItem(testDbPath, itemToUpdate);

    expect(updatedItem.info.agenda).toBe('새로운 토론 주제');

    // 파일의 실제 상태도 확인
    const db = JSON.parse(await fs.readFile(testDbPath, 'utf-8'));
    const itemInDb = db.find((item) => item.info.id === SAMPLE_UUID_1);

    expect(db).toHaveLength(2); // 전체 길이는 그대로인지 확인
    expect(itemInDb.info.agenda).toBe('새로운 토론 주제');
  });
});
