import { describe, it } from "node:test"
import assert from "node:assert/strict"
import parse from "../src/parser.js"

// Programs expected to be syntactically correct
const syntaxChecks = [
  ["variable declarations", 'int x := 1; float f := 10.0f; string var := "test";'],
  ["variable assignment", 'int x := 1; x = 2;'],
  ["typecast print", 'int x := 1; float y := (float) x; print((string) y);'],
  ["whileLoop", 'int x := 1; int y := 2; bool z := true; while (x < 2 && z) {x++;}'],
  ["ifBlock", `double x := 1.0; double y := 2.0; if (x < y) {print("x is smaller than y");}`],
  ["else ifBlock", `double x := 3.0; int y := 2; if (x < ((double) y)) {print("x is smaller than y");} else if (x > ((double) y)) {print("x is greater than y");}`],
  ["else ifBlock2", `double x := 3.0; int y := 2; if (x < ((double) y)) {print("x is smaller than y");} else if (x > ((double) y)) {print("x is greater than y");} else if (x == ((double) y)) {print("x is equal to y");}`],
  ["full ifBlock", `float x := 3.0f; int y := 3; if (((int) x) < y) {print("x is smaller than y");} else if (((int) x) > y) {print("x is greater than y");} else {print("x and y are equal");}`],
  ["forLoop", `for (int i := 0; i < 10; i++;) {print((string) i);}`],
  ["properBreak", `for (int i := 0; i < 10; i++;) {print((string) i); if (i == 5) {break;}}`],
  ["forEach", `int[] testArray := int[5](); for(int i in testArray) {print((string) i);}`],
  ["IterationPre", `int x := 1; for (int i := 0; i < 10; i++;) {++x;}`],
  ["IterationPost", `int x := 1; for (int i := 0; i < 10; i++;) {x++;}`],
  ["Args Function", `int f(int x, int y) {return x + 1;} f(1, 2);`],
  ["No Args Function", `void f() {print("Hello World");} f();`],
  ["Array", `int[] testArray := (int[5]());`],
  ["Array return", `int[] testArrayGiver() { return int[5](); } int[] testArray := testArrayGiver();`],
  ["Array Assignment", `int[] testArrayGiver() { int[] x := int[5](); x[0] = 1; x[1] = 2; return x; } int[] testArray := testArrayGiver() + testArrayGiver();`],
  ["Array Ops", `int[] x := int[5]() + int[5]();`],
  ["Numeral Ops", `int x := 1 + 1; x = 1 - 1; x = 1 * 1; x = 1 / 1; x = 1 % 1; x = 1 ** 1; x = -x; x = (x); int getX() {return 1;} x = getX();`],
  ["String Ops", `string x := "s" + "s"; string getX() {return "1";} x = getX(); x = ("x");`],
  ["Boolean Comparisons", 'float x := 1.0f; float y := 2.0f; bool z := x < y; z = x > y; z = x <= y; z = x >= y; z = x == y; z = x != y;'],
  ["Bool Comp 2", `bool z:= (bool) (true); z = false; bool getX() {return true;} z = (getX());`],
  ["Void Function", `void doNothing(int a, string b) {return;} int main() { print ((string) doNothing(5, "Hello")); return 0;}`],
  ["Void NoArgs", `void x() {return;} int main() { x(); return 0; }`],
  ["Operators", `int x := 1; x += 1; x -= 1; x *= 1; x /= 1;`],
  ["Operators More", `int x := 1; int y := x++; y = ++x;`],
  ["Bool Stuff", 
    `
    float x := 1.0f; 
    float y := 2.0f; 
    bool z := (x != y && x == y) || x < y;
    `
  ],
]

// Programs with syntax errors that the parser will detect
const syntaxErrors = [
  ["inproper variable declarations", 'int x = 1; float f := 10.0f; string var := "test";'],
  ["inproper variable assignment", 'int x := 1; x := 2;'],
  ["inproper variables", `for (ints i := 0; i < 10; i++;) {print((string) i);}`],
  ["inproper Ops", `int x := 1 ++ 1; x = 1 -- 1;`],
]

describe("The parser", () => {
  for (const [scenario, source] of syntaxChecks) {
    it(`matches ${scenario}`, () => {
      assert(parse(source).succeeded())
    })
  }
  for (const [scenario, source, errorMessagePattern] of syntaxErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => parse(source), errorMessagePattern)
    })
  }
})