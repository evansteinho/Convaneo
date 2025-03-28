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
    ["Boolean Comparisons1", 'float x := 1.0f; float y := 2.0f; bool z := x < y;'],
    ["Boolean Comparisons2", 'float x := 1.0f; float y := 2.0f; bool z := x > y;'],
    ["Boolean Comparisons3", 'float x := 1.0f; float y := 2.0f; bool z := x <= y;'],
    ["Boolean Comparisons4", 'float x := 1.0f; float y := 2.0f; bool z := x >= y;'],
    ["Boolean Comparisons5", 'float x := 1.0f; float y := 2.0f; bool z := x == y;'],
    ["Boolean Comparisons6", 'float x := 1.0f; float y := 2.0f; bool z := x != y;'],
    ["Boolean Expressions", 'float x := 1.0f; float y := 2.0f; bool z := x != y && x == y;'],
    ["Boolean Expressions1", `bool z := (1 != 1);`],
    ["Boolean Expressions2", `bool z := (1 < 2) || (1 != 1 && 1 == 1) || (1 < 2);`],
    ["Boolean Expressions3", `bool z := (1 < 2) || (1 != 1 && 1 == 1) || (1 < 2) || true || 1 == 1;`],
    ["Bool Comp 2", `bool z:= (bool) (true); z = false; bool getX() {return true;} z = (getX());`],
    ["Void Function", `void doNothing(int a, string b) {return;} int main() { print ((string) doNothing(5, "Hello")); return 0;}`],
    ["Void NoArgs", `void x() {return;} int main() { x(); return 0; }`],
    ["Operators", `int x := 1; x += 1; x -= 1; x *= 1; x /= 1;`],
    ["Operators More", `int x := 1; int y := x++; y = ++x;`],
    ["Recursive Test",
      `
      int factorial(int n) {
        if (n == 0) { return 1; }
        return n * factorial(n - 1);
      }

      int main() {
        print ((string) factorial(5));
        return 0;
      }
      `
    ],
    ["Nothing Test", 
      `
      void doNothing(int a, string b) {return;}

      int main() {
          print ((string) doNothing(5, "Hello"));
        return 0;
      }
      `
    ],
    ["Calling global variable",
      `
      int x := 1;
      int func() {
        return x;
      }
      print((string) func());
      `
    ],
    ["Assigning global variable when local var with same name exists",
      `
      int func() {
        int x := 1;
        return x;
      }
      int x := func();
      `
    ],
]

// Programs that are syntactically correct but have semantic errors
const semanticErrors = [
    ["inproper variable declarations", 'int x := 1.0f; string f := 10.0; string var = 10.0f;'],
    ["invalid variable assignments", 'x = 1; f = 10.0f; var = \"test\";'],
    ["inproper typecast", 'int x := 1; bool y := (bool) x;'],
    ["invalid whileLoop", 'int x := 1; int y := 2; bool z := true; while (x < z && z) {x++;}'],
    ["invalid whileLoop", 'int x := 1; int y := 2; bool z := true; while (x < y && a) {x++;}'],
    ["double else", `float x := 3.0f; int y := 3; if (((int) x) < y) {print("x is smaller than y");} else if (((int) x) > y) {print("x is greater than y");} else {print("x and y are equal");} else {print("x and y are equal");}`],
    ["double if", `float x := 3.0f; int y := 3; if (((int) x) < y) {print("x is smaller than y");} if (((int) x) < y) {print("x is smaller than y");} else if ((int) x > y) {print("x is greater than y");} else {print("x and y are equal");} else {print("x and y are equal");}`],
    ["inproper forLoop", `for (int i := 0; i = 10; i++;) {print((string) i);}`],
    ["inProperBreak", `break;`],
    ["Bad Function Call", `int f(int x, int y) {return x + 1;} f(1, 2, 3);`],
    ["NonExistant Function Call", 
      `
      main("hi");
      `
    ],
    ["Calling variable out of scope",
      `
      int func() {
        int x := 1;
        return x;
      }
      print(x);
      `
    ],
    ["Assigning local variable when global var with same name exists",
      `
      int x := 1;
      int func() {
        int x := 1;
        return x;
      }
      `
    ],
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