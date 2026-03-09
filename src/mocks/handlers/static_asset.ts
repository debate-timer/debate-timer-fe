import { http, HttpResponse } from 'msw';
import sampleLogo from '../../assets/template_logo/government.png';

const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

export const staticAssetHandlers = [
  http.get(baseUrl + '/icon/:iconFileName', async ({ params }) => {
    const { iconFileName } = params;
    console.log(`# Requested icon file's name = ${iconFileName}`);

    const targetLocalImage = sampleLogo;

    try {
      // 로컬 이미지 에셋을 ArrayBuffer의 형태로 불러옴
      const imageResponse = await fetch(targetLocalImage);
      const imageBuffer = await imageResponse.arrayBuffer();
      const contentType = 'image/png';

      // 실제 이미지 응답처럼 ArrayBuffer와 헤더를 반환
      return HttpResponse.arrayBuffer(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'max-age=31536000, immutable', // S3-like cache header
        },
      });
    } catch (error) {
      console.error('Failed to load mock image asset:', error);
      return new HttpResponse(null, { status: 500 });
    }
  }),
];
