import { describe, it } from "node:test";
import { ok, deepEqual, throws } from "node:assert/strict";
import parse from "../src/parser.js";

//node --test

const testExample =
  'string addToString(int a, string b) { return b + (string) a; } int increment(int x) {x++;} int decrement(int x) {x--;} int randomFunc(int x, int y) { int z := x * y ** x; if (x == 4) {z += 1;} return increment(z) ** decrement(x); } void doNothing(int a, string b) {return;} int factorial(int n) { if (n == 0) { return 1; } return n * factorial(n - 1); } int main() { print ((string) addToString(5, "Hello")); print ((string) randomFunc(5, 10)); print ((string) doNothing(5, "Hello")); print ((string)factorial(5)); print ("Hello World!"); return 0; }';

describe("Interpreter", () => {
  it("parses correctly", () => {
    ok(parse(testExample).succeeded());
  });
  it("throws on syntax errors", () => {
    throws(() => parse("printy"));
  });
});
