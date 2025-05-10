import * as fs from "fs";
import parse from "./parser.js";
import analyze from "./analyzer.js";
import optimize from "./optimizer.js";
import generate from "./generator.js";

if (process.argv.length !== 3) {
  console.error("Usage: node src/Convaneo.js FILENAME");
  process.exit(1);
}

const sourceCode = fs.readFileSync(process.argv[2], "utf8");
const match = parse(sourceCode);
const program = analyze(match);
const optimziedProgram = optimize(program)
const programString = generate(optimziedProgram)
fs.writeFile(`${process.argv[2]}.js`, programString, (err) => {
  if (err) throw err;
})