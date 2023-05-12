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
        throw new Error(`bad value: expected:(${expected}),actual:(${actual})`);
}

function toString(value, radix)
{
    return value.toString(radix);
}
noInline(toString);

function toString10(value)
{
    return `${value}`;
}
noInline(toString10);

function expected(num, radix)
{
    let characters = "0123456789abcdefghijklmnopqrstuvwxyz";
    let result = "";
    let negative = false;
    if (num < 0) {
        negative = true;
        num = -num;
    }

    do {
        const index = num % radix;
        result = characters[index] + result;
        num = (num - index) / radix;
    } while (num);

    if (negative)
        return '-' + result;
    return result;
}

for (var i = 0; i < 1e4; ++i) {
    toString(i, 10);
    toString(i, 36);
    toString10(i);
}

for (var radix = 2; radix < 37; ++radix) {
    for (var lessThanRadix = -2000; lessThanRadix < radix; ++lessThanRadix)
        shouldBe(toString(lessThanRadix, radix), expected(lessThanRadix, radix));
    for (var greaterThanRadix = radix; greaterThanRadix < 2000; ++greaterThanRadix)
        shouldBe(toString(greaterThanRadix, radix), expected(greaterThanRadix, radix));
}

{
    var radix = 10;
    for (var lessThanRadix = -2000; lessThanRadix < radix; ++lessThanRadix)
        shouldBe(toString10(lessThanRadix), expected(lessThanRadix, radix));
    for (var greaterThanRadix = radix; greaterThanRadix < 2000; ++greaterThanRadix)
        shouldBe(toString10(greaterThanRadix), expected(greaterThanRadix, radix));
}
