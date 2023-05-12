function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

function noInline() {
}

function OSRExit() {
}

function ensureArrayStorage() {
}

function fiatInt52(i) {
	return i;
}

function noDFG() {
}

function noOSRExitFuzzing() {
}

function isFinalTier() {
	return true;
}

function transferArrayBuffer() {
}

function fullGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function edenGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function forceGCSlowPaths() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function noFTL() {

}

function debug(x) {
	console.log(x);
}

function describe(x) {
	console.log(x);
}

function isInt32(i) {
	return (typeof i === "number");
}

function BigInt(i) {
	return i;
}

if (typeof(console) == "undefined") {
    console = {
        log: print
    };
}

if (typeof(gc) == "undefined") {
  gc = function() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
  }
}

if (typeof(BigInt) == "undefined") {
  BigInt = function (v) { return new Number(v); }
}

if (typeof(BigInt64Array) == "undefined") {
  BigInt64Array = function(v) { return new Array(v); }
}

if (typeof(BigUint64Array) == "undefined") { 
  BigUint64Array = function (v) { return new Array(v); }
}

if (typeof(quit) == "undefined") {
  quit = function() {
  }
}

function shouldBe(actual, expected)
{
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

var array = [];

for (var i = 0; i < 100; ++i)
    array.push(1024 * 1024 * 1024 * 1024 + i);
for (var i = 0; i < 100; ++i)
    array.push(-(1024 * 1024 * 1024 * 1024 + i));

array.push(2251799813685248);
array.push(0.5);

function test(array, index, value)
{
    return array[index] + fiatInt52(value);
}
noInline(test);

for (var i = 0; i < 1e4; ++i) {
    for (var index = 0; index < 100; ++index)
        shouldBe(test(array, index, 20), 1024 * 1024 * 1024 * 1024 + index + 20);
    for (var index = 0; index < 100; ++index)
        shouldBe(test(array, index + 100, 20), -(1024 * 1024 * 1024 * 1024 + index) + 20);
}

// Int52Overflow.
shouldBe(test(array, 200, 200), 2251799813685448);

// Not AnyIntAsDouble, Int52Overflow.
shouldBe(test(array, 201, 200), 200.5);

// Recompile the code as ArithAdd(Double, Double).
for (var i = 0; i < 1e4; ++i)
    shouldBe(test(array, 201, 200), 200.5);

shouldBe(test(array, 200, 200), 2251799813685448);
shouldBe(test(array, 201, 200), 200.5);


