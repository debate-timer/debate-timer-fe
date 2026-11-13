import { LANDING_STEPS } from './landingSteps';

describe('타임라인 단계', () => {
  it('준비 단계는 저장한 시간표와 대시보드 장면을 언어별 이미지로 보여 준다', () => {
    const prepare = LANDING_STEPS.find(({ id }) => id === 'prepare');

    expect(prepare?.scenes.map(({ id }) => id)).toEqual([
      'timetable',
      'dashboard',
    ]);
    prepare?.scenes.forEach(({ assets }) => {
      expect(assets.ko).toBeTruthy();
      expect(assets.en).toBeTruthy();
      expect(assets.en).not.toBe(assets.ko);
    });
  });

  it('진행 단계는 직접 하던 타이머 세팅과 타종을 미리 짜 둔 시간표로 바꾸는 장면 한 장을 보여 준다', () => {
    const run = LANDING_STEPS.find(({ id }) => id === 'run');

    expect(run?.scenes.map(({ id }) => id)).toEqual(['preset']);
    expect(run?.scenes[0].assets.ko).toBeTruthy();
  });

  it('마무리 단계에 피드백·승패 투표 장면 이미지를 연결한다', () => {
    const finish = LANDING_STEPS.find(({ id }) => id === 'finish');
    const scene = finish?.scenes.find(({ id }) => id === 'feedback-vote');

    expect(scene?.assets.ko).toBeTruthy();
    expect(scene?.assets.en).toBeTruthy();
    expect(scene?.assets.en).not.toBe(scene?.assets.ko);
  });

  it('시작 단계는 노트북 QR에서 휴대폰으로 이어지는 장면 이미지 한 장을 보여 준다', () => {
    const start = LANDING_STEPS.find(({ id }) => id === 'start');

    expect(start?.scenes.map(({ id }) => id)).toEqual(['share']);
    expect(start?.scenes[0].assets.ko).toBeTruthy();
    expect(start?.scenes[0].assets.en).toBeTruthy();
    expect(start?.scenes[0].assets.en).not.toBe(start?.scenes[0].assets.ko);
  });
});
