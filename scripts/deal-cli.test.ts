import { describe, it, expect } from 'vitest';
import { parseArgs, parseAddFlags } from './deal-cli';

describe('parseArgs', () => {
  it('extracts the command and rest args', () => {
    expect(parseArgs(['add', '--keyword', 'ARUBA'])).toEqual({
      command: 'add',
      rest: ['--keyword', 'ARUBA'],
    });
  });
  it('defaults to a help command when empty', () => {
    expect(parseArgs([])).toEqual({ command: 'help', rest: [] });
  });
});

describe('parseAddFlags', () => {
  it('parses all add flags into a DealEntryInput', () => {
    const result = parseAddFlags([
      '--keyword', 'aruba',
      '--deal-slug', 'aruba-3n',
      '--title', 'Aruba 3 Nights',
      '--destination', 'Aruba',
      '--price', '720',
      '--landing-path', '/d/aruba',
      '--dm-copy', 'Here is your Aruba deal!',
      '--expires', '2026-06-30',
    ]);
    expect(result).toEqual({
      keyword: 'ARUBA',
      dealSlug: 'aruba-3n',
      dealTitle: 'Aruba 3 Nights',
      destination: 'Aruba',
      price: 720,
      landingPath: '/d/aruba',
      dmCopy: 'Here is your Aruba deal!',
      expiresAt: '2026-06-30',
    });
  });
  it('throws when a required flag is missing', () => {
    expect(() => parseAddFlags(['--keyword', 'ARUBA'])).toThrow(/required/i);
  });
  it('throws when price is not numeric', () => {
    expect(() =>
      parseAddFlags([
        '--keyword', 'ARUBA',
        '--deal-slug', 'aruba-3n',
        '--title', 'Aruba 3 Nights',
        '--destination', 'Aruba',
        '--price', 'abc',
        '--landing-path', '/d/aruba',
        '--dm-copy', 'Here is your Aruba deal!',
      ])
    ).toThrow(/numeric/i);
  });
});
