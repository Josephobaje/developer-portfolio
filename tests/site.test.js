/**
 * Static checks on index.html: local files exist, anchors resolve, images have alt text,
 * external links are safe and the page has the expected SEO metadata.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

const attrValues = (tag, attr) =>
  [...html.matchAll(new RegExp(`<${tag}\\b[^>]*\\s${attr}="([^"]*)"`, 'g'))].map((m) => m[1]);

describe('index.html', () => {
  it('has exactly one h1 and a language attribute', () => {
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
    assert.match(html, /<html lang="en">/);
  });

  it('references only local files that exist', () => {
    const refs = [...attrValues('img', 'src'), ...attrValues('link', 'href'), ...attrValues('script', 'src')]
      .filter((ref) => !/^(https?:|mailto:|#)/.test(ref));
    assert.ok(refs.length > 5);
    for (const ref of refs) {
      assert.ok(existsSync(join(root, ref)), `missing file: ${ref}`);
    }
  });

  it('has resolvable in-page anchors', () => {
    const ids = new Set(attrValues('[a-z0-9]+', 'id'));
    for (const href of attrValues('a', 'href').filter((h) => h.startsWith('#'))) {
      assert.ok(ids.has(href.slice(1)), `no element with id ${href}`);
    }
  });

  it('gives every image alt text and explicit dimensions', () => {
    const imgs = html.match(/<img\b[^>]*>/g) ?? [];
    assert.ok(imgs.length >= 7);
    for (const img of imgs) {
      assert.match(img, /\salt="[^"]+"/, img);
      assert.match(img, /\swidth="\d+"/, img);
      assert.match(img, /\sheight="\d+"/, img);
    }
  });

  it('uses rel="noopener" on links that open a new tab', () => {
    for (const link of html.match(/<a\b[^>]*target="_blank"[^>]*>/g) ?? []) {
      assert.match(link, /rel="[^"]*noopener/, link);
    }
  });

  it('links every featured project to its GitHub repository', () => {
    const repos = [
      'Car-Rental-System-with-Flutterwave-payment-system',
      'shipment-tracker-flutter',
      'password-security-toolkit',
      'inventory-orders-api-php',
      'naira-expense-tracker-flutter',
      'security-log-analyzer',
      'wp-smart-seo',
      'fastapi-task-manager-api',
    ];
    for (const repo of repos) {
      assert.ok(html.includes(`https://github.com/Josephobaje/${repo}"`), repo);
    }
  });

  it('includes SEO and social metadata', () => {
    for (const pattern of [
      /<title>[^<]+<\/title>/,
      /<meta name="description" content="[^"]{50,160}">/,
      /<link rel="canonical" href="https:\/\/josephobaje\.github\.io\/developer-portfolio\/">/,
      /<meta property="og:image" content="https:[^"]+">/,
      /<meta name="twitter:card" content="summary_large_image">/,
      /"@type": "Person"/,
    ]) {
      assert.match(html, pattern);
    }
  });

  it('offers mailto contact without a backend', () => {
    assert.match(html, /href="mailto:josephobaje264@gmail\.com"/);
    assert.match(html, /<form[^>]+action="mailto:josephobaje264@gmail\.com"/);
  });
});
