/**
 * Pure helpers used by main.js. They have no DOM access so they can be unit-tested in Node.
 */

export const THEMES = Object.freeze(['light', 'dark']);

/**
 * Decide which theme to use.
 * @param {string | null} stored Value saved in localStorage, if any.
 * @param {boolean} prefersDark Whether the OS prefers a dark colour scheme.
 * @returns {'light' | 'dark'}
 */
export function resolveTheme(stored, prefersDark) {
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return prefersDark ? 'dark' : 'light';
}

/**
 * @param {'light' | 'dark'} theme
 * @returns {'light' | 'dark'}
 */
export function toggleTheme(theme) {
  return theme === 'dark' ? 'light' : 'dark';
}

/**
 * Does a project with these tags match the active filter?
 * @param {string} tagList Space-separated tags from a data attribute.
 * @param {string} filter Filter key, or "all".
 * @returns {boolean}
 */
export function matchesFilter(tagList, filter) {
  if (!filter || filter === 'all') {
    return true;
  }
  return tagList.toLowerCase().split(/\s+/).filter(Boolean).includes(filter.toLowerCase());
}

/**
 * Human-readable status for screen readers after filtering.
 * @param {number} count
 * @param {string} filter
 * @returns {string}
 */
export function filterStatus(count, filter) {
  const noun = count === 1 ? 'project' : 'projects';
  return filter === 'all' ? `Showing all ${count} ${noun}` : `Showing ${count} ${noun} tagged ${filter}`;
}

export const LIMITS = Object.freeze({ name: 100, subject: 150, message: 2000 });

/**
 * Validate the contact form fields.
 * @param {{name?: string, subject?: string, message?: string}} fields
 * @returns {Record<string, string>} Map of field name to error message (empty when valid).
 */
export function validateContact(fields) {
  /** @type {Record<string, string>} */
  const errors = {};
  const labels = { name: 'your name', subject: 'a subject', message: 'a message' };
  for (const key of /** @type {Array<keyof typeof LIMITS>} */ (Object.keys(LIMITS))) {
    const value = (fields[key] ?? '').trim();
    if (!value) {
      errors[key] = `Please enter ${labels[key]}.`;
    } else if (value.length > LIMITS[key]) {
      errors[key] = `Please keep this under ${LIMITS[key]} characters.`;
    }
  }
  if (!errors.message && (fields.message ?? '').trim().length < 10) {
    errors.message = 'Please write at least 10 characters.';
  }
  return errors;
}

/**
 * Build a mailto: URL with an encoded subject and body.
 * @param {string} to Recipient address.
 * @param {{name: string, subject: string, message: string}} fields
 * @returns {string}
 */
export function buildMailto(to, fields) {
  const subject = fields.subject.trim();
  const body = `${fields.message.trim()}\n\n${fields.name.trim()}`;
  const params = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return `mailto:${to}?${params}`;
}
