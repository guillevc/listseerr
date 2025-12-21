import { describe, it, expect } from 'bun:test';
import { parseMdbListUrl, buildMdbListApiUrl } from './url-parser';

describe('parseMdbListUrl', () => {
  it('extracts username and listSlug from basic URL', () => {
    const result = parseMdbListUrl(
      'https://mdblist.com/lists/linaspurinis/top-watched-movies-of-the-week'
    );
    expect(result.username).toBe('linaspurinis');
    expect(result.listSlug).toBe('top-watched-movies-of-the-week');
  });

  it('handles URL with www prefix', () => {
    const result = parseMdbListUrl('https://www.mdblist.com/lists/hdlists/top-movies');
    expect(result.username).toBe('hdlists');
    expect(result.listSlug).toBe('top-movies');
  });

  it('handles URL with trailing slash', () => {
    const result = parseMdbListUrl('https://mdblist.com/lists/linaspurinis/trending-shows/');
    expect(result.username).toBe('linaspurinis');
    expect(result.listSlug).toBe('trending-shows');
  });

  it('handles http protocol', () => {
    const result = parseMdbListUrl('http://mdblist.com/lists/user123/my-list');
    expect(result.username).toBe('user123');
    expect(result.listSlug).toBe('my-list');
  });

  it('throws error for invalid URL format', () => {
    expect(() => parseMdbListUrl('https://mdblist.com/invalid/path')).toThrow();
  });

  it('throws error for empty string', () => {
    expect(() => parseMdbListUrl('')).toThrow();
  });

  it('throws error for non-mdblist URL', () => {
    expect(() => parseMdbListUrl('https://trakt.tv/users/hdlists/lists/fantasy')).toThrow();
  });

  it('throws error for mdblist URL without list path', () => {
    expect(() => parseMdbListUrl('https://mdblist.com/lists/username')).toThrow();
  });
});

describe('buildMdbListApiUrl', () => {
  it('builds correct API URL with all parameters', () => {
    const parts = { username: 'linaspurinis', listSlug: 'top-watched-movies-of-the-week' };
    const result = buildMdbListApiUrl(parts, 100, 'test-api-key');

    expect(result).toBe(
      'https://api.mdblist.com/lists/linaspurinis/top-watched-movies-of-the-week/items/?limit=100&apikey=test-api-key&unified=true'
    );
  });

  it('includes unified parameter', () => {
    const parts = { username: 'hdlists', listSlug: 'my-list' };
    const result = buildMdbListApiUrl(parts, 50, 'key123');

    expect(result).toContain('unified=true');
  });

  it('correctly encodes limit parameter', () => {
    const parts = { username: 'user', listSlug: 'list' };
    const result = buildMdbListApiUrl(parts, 250, 'key');

    expect(result).toContain('limit=250');
  });
});
