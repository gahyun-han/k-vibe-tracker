import { describe, it, expect } from 'vitest';
import { extractVideoId, isValidYoutubeUrl, getThumbnailUrl } from '@/lib/youtube';

describe('extractVideoId', () => {
  it('표준 watch URL에서 추출', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('youtu.be 단축 URL에서 추출', () => {
    expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('shorts URL에서 추출', () => {
    expect(extractVideoId('https://www.youtube.com/shorts/abc123XYZ')).toBe('abc123XYZ');
  });

  it('embed URL에서 추출', () => {
    expect(extractVideoId('https://www.youtube.com/embed/testVideoId')).toBe('testVideoId');
  });

  it('쿼리스트링 추가 파라미터가 있어도 추출', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s')).toBe('dQw4w9WgXcQ');
  });

  it('비유튜브 URL → null', () => {
    expect(extractVideoId('https://www.google.com/')).toBeNull();
  });

  it('빈 문자열 → null', () => {
    expect(extractVideoId('')).toBeNull();
  });

  it('유효하지 않은 URL → null', () => {
    expect(extractVideoId('not-a-url')).toBeNull();
  });

  it('youtu.be 슬래시만 있고 ID 없음 → null', () => {
    expect(extractVideoId('https://youtu.be/')).toBeNull();
  });

  it('youtube.com이지만 v 파라미터 없고 경로도 없음 → null', () => {
    expect(extractVideoId('https://www.youtube.com/')).toBeNull();
  });
});

describe('isValidYoutubeUrl', () => {
  it('유효한 watch URL → true', () => {
    expect(isValidYoutubeUrl('https://www.youtube.com/watch?v=abc123')).toBe(true);
  });

  it('유효한 youtu.be URL → true', () => {
    expect(isValidYoutubeUrl('https://youtu.be/abc123')).toBe(true);
  });

  it('비유튜브 URL → false', () => {
    expect(isValidYoutubeUrl('https://vimeo.com/123456')).toBe(false);
  });

  it('빈 문자열 → false', () => {
    expect(isValidYoutubeUrl('')).toBe(false);
  });
});

describe('getThumbnailUrl', () => {
  it('올바른 썸네일 URL 생성', () => {
    expect(getThumbnailUrl('dQw4w9WgXcQ')).toBe(
      'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    );
  });

  it('임의 videoId에 대한 형식 검증', () => {
    const url = getThumbnailUrl('testId');
    expect(url).toContain('testId');
    expect(url).toContain('img.youtube.com');
    expect(url).toContain('hqdefault.jpg');
  });
});
