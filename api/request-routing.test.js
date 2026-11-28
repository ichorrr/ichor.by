import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeRequestHost, shouldRedirectToCanonicalHost } from './request-routing.js';

test('local API hosts bypass the public canonical redirect', () => {
  for (const host of ['localhost:4000', '127.0.0.1:4000', '0.0.0.0:4000', '[::1]:4000']) {
    assert.equal(shouldRedirectToCanonicalHost(host, 'http'), false);
  }
});

test('public API host remains available over HTTP for proxy termination', () => {
  assert.equal(shouldRedirectToCanonicalHost('api.ichor.by:4000', 'http'), false);
});

test('public web hosts retain canonical HTTPS redirects', () => {
  assert.equal(shouldRedirectToCanonicalHost('www.ichor.by', 'https'), true);
  assert.equal(shouldRedirectToCanonicalHost('ichor.by', 'http'), true);
  assert.equal(shouldRedirectToCanonicalHost('ichor.by', 'https'), false);
});

test('request host normalization supports bracketed IPv6 and ports', () => {
  assert.equal(normalizeRequestHost('[::1]:4000'), '::1');
  assert.equal(normalizeRequestHost('localhost:4000'), 'localhost');
});
