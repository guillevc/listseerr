import { describe, it, expect } from 'bun:test';
import { parseTraktUrl, convertDisplayUrlToApiUrl } from './url-parser';

describe('parseTraktUrl', () => {
  it('extracts username and listSlug from basic URL', () => {
    const result = parseTraktUrl('https://trakt.tv/users/hdlists/lists/fantasy-movies');
    expect(result.username).toBe('hdlists');
    expect(result.listSlug).toBe('fantasy-movies');
    expect(result.sortField).toBeUndefined();
    expect(result.sortOrder).toBeUndefined();
    expect(result.mediaFilter).toBeUndefined();
  });

  it('extracts sort parameters', () => {
    const result = parseTraktUrl(
      'https://trakt.tv/users/hdlists/lists/fantasy-movies?sort=added,asc'
    );
    expect(result.sortField).toBe('added');
    expect(result.sortOrder).toBe('asc');
  });

  it('extracts display filter for movie', () => {
    const result = parseTraktUrl(
      'https://trakt.tv/users/hdlists/lists/fantasy-movies?display=movie'
    );
    expect(result.mediaFilter).toBe('movie');
  });

  it('extracts display filter for show', () => {
    const result = parseTraktUrl(
      'https://trakt.tv/users/hdlists/lists/fantasy-movies?display=show'
    );
    expect(result.mediaFilter).toBe('show');
  });

  it('extracts all parameters from complex URL', () => {
    const url =
      'https://trakt.tv/users/hdlists/lists/fantasy-movies?foo=bar&sort=added,asc&display=movie';
    const result = parseTraktUrl(url);
    expect(result.username).toBe('hdlists');
    expect(result.listSlug).toBe('fantasy-movies');
    expect(result.sortField).toBe('added');
    expect(result.sortOrder).toBe('asc');
    expect(result.mediaFilter).toBe('movie');
  });

  it('handles sort with different field and order combinations', () => {
    const result = parseTraktUrl(
      'https://trakt.tv/users/hdlists/lists/fantasy-movies?sort=title,desc'
    );
    expect(result.sortField).toBe('title');
    expect(result.sortOrder).toBe('desc');
  });

  it('throws error for invalid URL format', () => {
    expect(() => parseTraktUrl('https://trakt.tv/invalid/path')).toThrow();
  });
});

describe('convertDisplayUrlToApiUrl', () => {
  it('converts URL with sort and display to correct API path', () => {
    const input =
      'https://trakt.tv/users/hdlists/lists/fantasy-movies?foo=bar&sort=added,asc&display=movie';
    const result = convertDisplayUrlToApiUrl(input);

    expect(result.apiUrl).toBe(
      'https://api.trakt.tv/users/hdlists/lists/fantasy-movies/items/movie/added/asc'
    );
    expect(result.displayUrl).toBe(
      'https://trakt.tv/users/hdlists/lists/fantasy-movies?display=movie&sort=added,asc'
    );
  });

  it('uses "all" when display is missing but sort is present', () => {
    const input = 'https://trakt.tv/users/hdlists/lists/fantasy-movies?sort=added,asc';
    const result = convertDisplayUrlToApiUrl(input);

    expect(result.apiUrl).toBe(
      'https://api.trakt.tv/users/hdlists/lists/fantasy-movies/items/all/added/asc'
    );
    expect(result.displayUrl).toBe(
      'https://trakt.tv/users/hdlists/lists/fantasy-movies?sort=added,asc'
    );
  });

  it('omits sort path when sort is missing', () => {
    const input = 'https://trakt.tv/users/hdlists/lists/fantasy-movies?display=movie';
    const result = convertDisplayUrlToApiUrl(input);

    expect(result.apiUrl).toBe(
      'https://api.trakt.tv/users/hdlists/lists/fantasy-movies/items/movie'
    );
    expect(result.displayUrl).toBe(
      'https://trakt.tv/users/hdlists/lists/fantasy-movies?display=movie'
    );
  });

  it('handles basic URL without params - uses "all" default', () => {
    const input = 'https://trakt.tv/users/hdlists/lists/fantasy-movies';
    const result = convertDisplayUrlToApiUrl(input);

    expect(result.apiUrl).toBe('https://api.trakt.tv/users/hdlists/lists/fantasy-movies/items/all');
    expect(result.displayUrl).toBe('https://trakt.tv/users/hdlists/lists/fantasy-movies');
  });

  it('filters out irrelevant query params from displayUrl', () => {
    const input =
      'https://trakt.tv/users/hdlists/lists/fantasy-movies?utm_source=test&display=show&sort=title,asc&campaign=promo';
    const result = convertDisplayUrlToApiUrl(input);

    expect(result.displayUrl).toBe(
      'https://trakt.tv/users/hdlists/lists/fantasy-movies?display=show&sort=title,asc'
    );
  });

  it('handles show display filter', () => {
    const input = 'https://trakt.tv/users/hdlists/lists/fantasy-movies?display=show&sort=rank,desc';
    const result = convertDisplayUrlToApiUrl(input);

    expect(result.apiUrl).toBe(
      'https://api.trakt.tv/users/hdlists/lists/fantasy-movies/items/show/rank/desc'
    );
  });
});
