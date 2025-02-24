import { describe, it } from "node:test";
import assert from "assert";
import * as ohm from "ohm-js";

const grammars = {
  canadianPostalCode: String.raw`
    code = L digit L " " digit L digit
    L    = "A" | "B" | "C" | "E" | "G" | "H" | "J" | "K" | "L" | "M" | "N" | "P" | "R" | "S" | "T" | "V" | "W" | "X" | "Y" | "Z"
    digit = "0".."9"
  `,

  visa: String.raw`
    card = "4" ( digit digit digit digit digit digit digit digit
                digit digit digit digit digit digit digit
              | digit digit digit digit digit digit digit digit
                digit digit digit digit )
    digit = "0".."9"
  `,

  masterCard: String.raw`
    card = five | two
    five = "5" ("1" | "2" | "3" | "4" | "5")
           digit digit digit digit digit digit digit
           digit digit digit digit digit digit digit
    two  = twoPrefix
           digit digit digit digit digit digit digit
           digit digit digit digit digit digit
    twoPrefix =
         "222" ("1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9")
      |  "22"  ("3" | "4" | "5" | "6" | "7" | "8" | "9") digit
      |  "2"   ("3" | "4" | "5" | "6") digit digit
      |  "27"  ( ("0" digit) | ("1" digit) | "20" )
    digit = "0".."9"
  `,

  notThreeEndingInOO: String.raw`
    s = empty | one | two | threeOk | longer
    empty = ""
    one = letter
    two = letter letter
    threeOk = letter (letter - ("o"|"O")) ("o"|"O")
            | letter ("o"|"O") (letter - ("o"|"O"))
            | letter (letter - ("o"|"O")) (letter - ("o"|"O"))
    longer = letter letter letter letter+
    letter = "A".."Z" | "a".."z"
  `,

  divisibleBy16: String.raw`
    num = zeros | nonZero
    zeros = "0"+
    nonZero = "1" binary* "0000"
    binary = "0" | "1"
  `,

  eightThroughThirtyTwo: String.raw`
    num = "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19"
        | "20" | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28" | "29"
        | "30" | "31" | "32"
  `,

  notPythonPycharmPyc: String.raw`
    s = "" | ~( "python" | "pycharm" | "pyc" ) letters
    letters = letter+
    letter = "a".."z" | "A".."Z"
  `,

  restrictedFloats: String.raw`
    float = mantissa expo
    mantissa = digit+ ("." digit*)?
    expo = ("e"|"E") ("+"|"-")? digit digit? digit?
    digit = "0".."9"
  `,

  palindromes2358: String.raw`
    p = pal2 | pal3 | pal5 | pal8
    pal2 = a:("a"|"b"|"c") a
    pal3 = a:("a"|"b"|"c") b:("a"|"b"|"c") a
    pal5 = a:("a"|"b"|"c") b:("a"|"b"|"c") c:("a"|"b"|"c") b a
    pal8 = a:("a"|"b"|"c") b:("a"|"b"|"c") c:("a"|"b"|"c") d:("a"|"b"|"c") d c b a
  `,

  pythonStringLiterals: String.raw`
    str = fstr | short | long
    fstr = ("f"|"F") (short | long)
    short = sq | dq
    sq = "'" sqc* "'"
    dq = '"' dqc* '"'
    sqc = "\\\\" any | (~"'" any)
    dqc = "\\\\" any | (~'"' any)
    long = tqs | tqd
    tqs = "'''" tqsC* "'''"
    tqd = '"""' tqdC* '"""'
    tqsC = ~"'''" any
    tqdC = ~'"""' any
    any = .
  `,
};

function matches(name, string) {
  // Remove extra whitespace from each line.
  const inner = grammars[name]
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
  const grammarSrc = `G {\n${inner}\n}`;
  return ohm.grammar(grammarSrc).match(string).succeeded();
}

const testFixture = {
  palindromes2358: {
    good: [
      "aa", "bb", "cc", "aaa", "aba", "aca",
      "bab", "bbb", "ababa", "abcba", "aaaaaaaa",
      "abaaaaba", "cbcbbcbc", "caaaaaac",
    ],
    bad: ["", "a", "ab", "abc", "abbbb", "cbcbcbcb"],
  },
  pythonStringLiterals: {
    good: String.raw`''
      ""
      'hello'
      "world"
      'a\'b'
      "a\"b"
      '\n'
      "a\tb"
      f'\u'
      """abc"""
      '''a''"''"'''
      """abc\xdef"""
      '''abc\$def'''
      '''abc\''''`
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
    bad: String.raw`
      'hello"
      "world'
      'a'b'
      "a"b"
      'a''
      "x""
      """""""" 
      frr"abc"
      'a\'
      '''abc''''
      """`
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
  },
};

for (let name of Object.keys(testFixture)) {
  describe(`when matching ${name}`, () => {
    for (let s of testFixture[name].good) {
      it(`accepts ${JSON.stringify(s)}`, () => {
        assert.ok(matches(name, s));
      });
    }
    for (let s of testFixture[name].bad) {
      it(`rejects ${JSON.stringify(s)}`, () => {
        assert.ok(!matches(name, s));
      });
    }
  });
}
