import { describe, it } from "node:test"
import assert from "node:assert/strict"
import parse from "../src/parser.js"
import analyze from "../src/analyzer.js"
import optimize from "../src/optimizer.js"
import generate from "../src/generator.js"

function dedent(s) {
    return `${s}`.replace(/(?<=\n)\s+/g, "").trim()
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
        `
    },
    {
        name: `Idk whats this supposed to do`,
        source: ` 
            int test(int x, int z, int y) {
                if (x == z) { 
                    while (z == y) {
                        //Does Something
                        int w := 5; 
                        return ++w;
                    }
                } else if (z == y) {
                    int w := x ** y;
                    return w++;
                } else {
                    int w := 0
                    while (x > 0) {
                        w += z * y;
                        x--;
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
            test(x, z, y);
        `,
        expected: dedent`
            function test(x, z, y) {
                if (x === z) {
                    while (z === y) {
                        let w = 5
                        return ++w
                    }
                } else if (z === y) {
                    let w = x ** y
                    return w++
                } else {
                    let w = 0
                    while (x > 0) {
                        w += z * y
                        x--
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
            test(x, z, y)
        `
    }
] 

describe("The code generator", () => {
    for (const fixture of fixtures) {
      it(`produces expected js output for the ${fixture.name} program`, () => {
        const actual = generate(optimize(analyze(parse(fixture.source))))
        assert.deepEqual(actual, fixture.expected)
      })
    }
  })