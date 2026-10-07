import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildMailto,
  filterStatus,
  matchesFilter,
  resolveTheme,
  toggleTheme,
  validateContact,
} from '../js/lib.js';

describe('resolveTheme', () => {
  it('prefers a saved choice', () => {
    assert.equal(resolveTheme('light', true), 'light');
    assert.equal(resolveTheme('dark', false), 'dark');
  });

  it('falls back to the OS preference', () => {
    assert.equal(resolveTheme(null, true), 'dark');
    assert.equal(resolveTheme(null, false), 'light');
  });

  it('ignores unexpected stored values', () => {
    assert.equal(resolveTheme('purple', false), 'light');
  });
});

describe('toggleTheme', () => {
  it('flips between light and dark', () => {
    assert.equal(toggleTheme('light'), 'dark');
    assert.equal(toggleTheme('dark'), 'light');
  });
});

describe('matchesFilter', () => {
  it('shows everything for "all" or an empty filter', () => {
    assert.ok(matchesFilter('php api', 'all'));
    assert.ok(matchesFilter('php api', ''));
  });

  it('matches whole tags only, case-insensitively', () => {
    assert.ok(matchesFilter('python security', 'Security'));
    assert.ok(!matchesFilter('python security', 'sec'));
    assert.ok(!matchesFilter('', 'php'));
  });
});

describe('filterStatus', () => {
  it('pluralises and names the filter', () => {
    assert.equal(filterStatus(8, 'all'), 'Showing all 8 projects');
    assert.equal(filterStatus(1, 'wordpress'), 'Showing 1 project tagged wordpress');
  });
});

describe('validateContact', () => {
  const valid = { name: 'Ada', subject: 'Project', message: 'I would like to hire you.' };

  it('accepts a complete message', () => {
    assert.deepEqual(validateContact(valid), {});
  });

  it('requires every field', () => {
    const errors = validateContact({ name: ' ', subject: '', message: undefined });
    assert.deepEqual(Object.keys(errors).sort(), ['message', 'name', 'subject']);
  });

  it('enforces length limits', () => {
    assert.ok(validateContact({ ...valid, subject: 'x'.repeat(151) }).subject);
    assert.ok(validateContact({ ...valid, message: 'too short' }).message);
  });
});

describe('buildMailto', () => {
  it('encodes subject and body', () => {
    const url = buildMailto('me@example.com', {
      name: 'Ada & Co',
      subject: 'Hello? 50% off',
      message: 'Line one\nLine two',
    });
    assert.equal(
      url,
      'mailto:me@example.com?subject=Hello%3F%2050%25%20off&body=Line%20one%0ALine%20two%0A%0AAda%20%26%20Co',
    );
  });
});
