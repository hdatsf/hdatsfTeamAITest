import assert from 'node:assert/strict';
import test from 'node:test';
import { greet } from '../src/greet.mjs';

test('greet includes the given name', () => {
  assert.match(greet('HDATSF'), /HDATSF/);
});

test('greet has a default name', () => {
  assert.match(greet(), /TeamAI/);
});
