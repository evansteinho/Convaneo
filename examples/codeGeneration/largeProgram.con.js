function heapify(arr, n, i) {
let largest = i
let left = 2 * i + 1
let right = 2 * i + 2
if (left < n && arr[left] > arr[largest]) {
largest = left
}
if (right < n && arr[right] > arr[largest]) {
largest = right
}
if (largest != i) {
let temp = arr[i]
arr[i] = arr[largest]
arr[largest] = temp
arr = heapify(arr, n, largest)
}
return arr
}
function heapSort(arr) {
let arrLength = 0
arr.forEach(function(x) {
arrLength++
})
for(let i = arrLength / 2 - 1; i >= 0; i--) {
arr = heapify(arr, arrLength, i)
}
for(let j = arrLength - 1; j > 0; j--) {
let temp = arr[0]
arr[0] = arr[j]
arr[j] = temp
arr = heapify(arr, j, 0)
}
return arr
}
let a = new Array(5)
a[0] = 10
a[1] = 30
a[2] = 239
a[3] = 1
a[4] = 4
a = heapSort(a)
a.forEach(function(x) {
console.log(String(x))
})