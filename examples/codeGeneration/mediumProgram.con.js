function gcd(x, y) {
let result = x
if (y < x) {
result = y
}
while (result > 0) {
if (x % result === 0 && y % result === 0) {
break
}
result--
}
return result
}
let a = 4
let b = 6
console.log(String(gcd(a, b)))