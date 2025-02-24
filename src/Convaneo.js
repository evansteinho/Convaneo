import * as fs from "fs";
import parse from "./parser.js";

if (process.argv.length !== 3) {
  console.error("Usage: node src/Convaneo.js FILENAME");
  process.exit(1);
}

const sourceCode = fs.readFileSync(process.argv[2], "utf8");
const match = parse(sourceCode);
console.log(match);
// const program = analyze(match);