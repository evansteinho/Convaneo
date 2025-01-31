import {describe, it} from 'node:test';
import {deepEqual} from 'node:assert/strict';
import {add} from '../src/Convaneo.js';

describe('Compiler', () => {
    it('should compile the code', () => {
        deepEqual(add(1, 2), 3);
    });
});