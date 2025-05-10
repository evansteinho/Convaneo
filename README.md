![logo](docs/logo.png)

# Convaneo Language

Story

- Our language was created in the year 1125 AD in the small duchy of Meckleburg. It's humble origins was pioneered by Von Duckleburg III who saw 900 years into the future where such a programming language was neccisary for three students stidying compilers. We set to advance Von Duckleburg III's original idea of a perfect programming language and create Convaneo, a statically typed language focused on being simple and straight to the point.

Website
convaneo.vercel.app

Features

- Our language will feature most of the tools that modern programming languages enjoy including but not limited to:
- If/If Else/Else Statements
- Standard Primitive Types (bools, ints, floats, strings, etc)
- Built in Iteration Method (foreach loops)
- Boolean Logic
- Arithmatic Operators with Ints and Floats (\*, +, -, /, \*\*, //, ++, --)
- String Methods (slicing, formatting, appending, etc)
- Built in Datastructures (Arrays)
- Build in Typecasting for Primative Types
- Built in Function Overloading (Overload typecast, Overload operators, etc)

Examples

- In Convaneo:

```
int increment(int x) {x++;}
int decrement(int x) {x--;}
int randomFunc(int x, int y) {
	int z = x * y ** x;
  	if (x == 4) {z += 1;}
	return z ** x;
}
void doNothing(int a, string b) {}
string addToString(int a, string b) {
	return b + (string) a;
}
```

- In Javascript:

```
function increment(x) {x += 1;}
function decrement(x) {x -= 1;}
function randomFunc(x, y) {
  	let z = x * y ** x;
  	if (x == 4) {
  		z += 1;
	}
  	return z ** x;
}
function doNothing(int a, string b) {}
function addToString(a, b) {return b + a}
```
