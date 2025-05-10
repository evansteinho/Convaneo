import { describe, it } from "node:test";
import assert from "node:assert/strict";
import parse from "../src/parser.js";
import analyze from "../src/analyzer.js";
import generate from "../src/generator.js";

function dedent(s) {
  return `${s}`.replace(/(?<=\n)\s+/g, "").trim();
}

// Programs with syntax errors that the parser will detect
const fixtures = [
  {
    name: `Greeting Function`,
    source: ` 
            void printHello(string name, string message) {
                print ("Greetings\n" + name + " said " + message);
            }
            printHello("John", "ni hao");
            string test := "ni bu hao";
            test = "actually nvm";
            printHello("John", test);
        `,
    expected: dedent`
            function printHello(name, message) {
                console.log("Greetings\n" + name + " said " + message)
            }
            printHello("John", "ni hao")
            let test = "ni bu hao"
            test = "actually nvm"
            printHello("John", test)
        `,
  },
  {
    name: `Idk whats this supposed to do`,
    source: ` 
            int test(int x, int z, int y) {
                if (x == z) { 
                    while (z == y && true) {
                        //Does Something
                        int w := 5; 
                        return ++w;
                    }
                } else if (z == y) {
                    int w := x ** y;
                    return w++;
                } else {
                    int w := 0
                    while (x > 0 || x == 10) {
                        w += z * y;
                        x--;
                        x -= 0;
                    }
                    return w;
                }
            }

            int x := 1;
            int z := 1;
            int y := 1;
            test(x, z, y);
            x = test(x, z, y);
            z = 2 + x;
            y = 2 / z;
            float tester := (float) test(x, z, y);
            double testerDouble := (double) test(x, z, y);
            int testerInt := (int) test(x, z, y);
            int i := (int) x;
            float a := (float) x;
            double b := (double) x;
            string c := (string) x;
            bool d := (bool) x == x;
        `,
    expected: dedent`
            function test(x, z, y) {
                if (x === z) {
                    while (z === y && true) {
                        let w = 5
                        return ++w
                    }
                }
                else if (z === y) {
                    let w = x ** y
                    return w++
                }
                else {
                    let w = 0
                    while (x > 0 || x === 10) {
                        w += z * y
                        x--
                        x -= 0
                    }
                    return w
                }
            }
            let x = 1
            let z = 1
            let y = 1
            test(x, z, y)
            x = test(x, z, y)
            z = 2 + x
            y = 2 / z
            let tester = parseFloat(test(x, z, y))
            let testerDouble = Number(test(x, z, y))
            let testerInt = parseInt(test(x, z, y))
            let i = parseInt(x)
            let a = parseFloat(x)
            let b = Number(x)
            let c = String(x)
            let d = Boolean(x === x)
        `,
  },
  {
    name: `forloops and forEach`,
    source: ` 
            int[] array := int[5]();
            array[0] = 0;
            array[1] = 1;
            array[2] = 2;
            array[3] = 3;
            array[4] = 4;
            array = array + array;
            for(int i := 0; i < 5; i++;) {
                print((string) array[i]);
                if (i == 4) {
                    break;
                }
            }
            for(int item in array) {
                print((string) array[item]);
            }
        `,
    expected: dedent`
            let array = new Array(5)
            array[0] = 0
            array[1] = 1
            array[2] = 2
            array[3] = 3
            array[4] = 4
            array = array + array
            for(let i = 0; i < 5; i++) {
                console.log(String(array[i]))
                if (i === 4) {
                    break
                }
            }
            array.forEach(function(item) {
                console.log(String(array[item]))
            })
        `,
  },
  {
    name: `other`,
    source: `
            int[] x := int[5]() + int[5]();
            void hi() {
                return;
            }
            hi();
        `,
    expected: dedent`
            let x = new Array(5) + new Array(5)
            function hi() {
                return
            }
            hi()
        `,
  },
];

describe("The code generator", () => {
  for (const fixture of fixtures) {
    it(`produces expected js output for the ${fixture.name} program`, () => {
      const actual = generate(analyze(parse(fixture.source)));
      assert.deepEqual(actual, fixture.expected);
    });
  }
});
