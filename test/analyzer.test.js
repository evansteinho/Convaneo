import { describe, it } from "node:test"
import assert from "node:assert/strict"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"

// Programs that are semantically correct
const semanticChecks = [
    ["variable declarations", 'int x := 1; float f := 10.0f; string var := "test";'],
    ["variable assignment", 'int x := 1; x = 2;'],
    ["typecast print", 'int x := 1; float y := (float) x; print((string) y);'],
    ["whileLoop", 'int x := 1; int y := 2; bool z := true; while (x < 2 && z) {x++;}'],
    ["ifBlock", `double x := 1.0; double y := 2.0; if (x < y) {print("x is smaller than y");}`],
    ["else ifBlock", `double x := 3.0; int y := 2; if (x < (double) y) {print("x is smaller than y");} else if (x > (double) y) {print("x is greater than y");}`],
    ["full ifBlock", `float x := 3.0f; int y := 3; if ((int) x < y) {print("x is smaller than y");} else if ((int) x > y) {print("x is greater than y");} else {print("x and y are equal");}`],
    ["full ifBlock", `float x := 3.0f; int y := 3; if ((int) x < y) {print("x is smaller than y");} else if ((int) x > y) {print("x is greater than y");} else {print("x and y are equal");}`],
    ["forLoop", `for (int i := 0; i < 10; i++;) {print((string) i);}`],
    ["properBreak", `for (int i := 0; i < 10; i++;) {print((string) i); if (i == 5) {break;}}`],
    ["forEach", `int[] testArray := int[5](); for(int i in testArray) {print((string) i);}`],
    ["IterationPre", `int x := 1; for (int i := 0; i < 10; i++;) {++x;}`],
    ["IterationPost", `int x := 1; for (int i := 0; i < 10; i++;) {x++;}`],
    ["Args Function", `int f(int x, int y) {return x + 1;} f(1, 2);`],
    ["No Args Function", `void f() {print("Hello World");} f();`],
    ["Array", `int[] testArray := (int[5]());`],
    ["Array", `int[] testArrayGiver() { return int[5](); } int[] testArray := testArrayGiver();`],
    ["Numeral Ops", `int x := 1 + 1; x = 1 - 1; x = 1 * 1; x = 1 / 1; x = 1 % 1; x = 1 ** 1; x = -x; x = (x); int getX() {return 1;} x = getX();`],
]

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
    ["inproper variable declarations", 'int x := 1.0f; string f := 10.0; string var = 10.0f;'],
    ["invalid variable assignments", 'x = 1; f = 10.0f; var = \"test\";'],
    ["inproper typecast", 'int x := 1; bool y := (bool) x;'],
    ["invalid whileLoop", 'int x := 1; int y := 2; bool z := true; while (x < z && z) {x++;}'],
    ["invalid whileLoop", 'int x := 1; int y := 2; bool z := true; while (x < y && a) {x++;}'],
    ["double else", `float x := 3.0f; int y := 3; if ((int) x < y) {print("x is smaller than y");} else if ((int) x > y) {print("x is greater than y");} else {print("x and y are equal");} else {print("x and y are equal");}`],
    ["double if", `float x := 3.0f; int y := 3; if ((int) x < y) {print("x is smaller than y");} if ((int) x < y) {print("x is smaller than y");} else if ((int) x > y) {print("x is greater than y");} else {print("x and y are equal");} else {print("x and y are equal");}`],
    ["inproper forLoop", `for (int i := 0; i = 10; i++;) {print((string) i);}`],
    ["inProperBreak", `break;`],
    ["Bad Function Call", `int f(int x, int y) {return x + 1;} f(1, 2, 3);`],
]

describe("The analyzer", () => {
  for (const [scenario, source] of semanticChecks) {
    it(`recognizes ${scenario}`, () => {
      assert.ok(analyze(parse(source)))
    })
  }
  for (const [scenario, source, errorMessagePattern] of semanticErrors) {
    it(`throws on ${scenario}`, () => {
      assert.throws(() => analyze(parse(source)), errorMessagePattern)
    })
  }
})