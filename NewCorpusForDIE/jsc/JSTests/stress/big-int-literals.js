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

function assert(a) {
    if (!a)
        throw new Error("Bad assertion");
}

function assertThrowSyntaxError(input) {
    try {
        eval(input);
        assert(false);
    } catch (e) {
        assert(e instanceof SyntaxError);
    }
}

// Test 0 conversions
let n = 0n;
assert(n === 0n);

// Binary representation

n = 0b1111n;
assert(n === 15n);

n = 0b10n;
assert(n === 2n);

n = 0b010n;
assert(n === 2n);

let binaryString = "0b1";
for (let i = 0; i < 128; i++)
    binaryString += "0";

n = eval(binaryString + "n");
assert(n === 340282366920938463463374607431768211456n);

n = 0B1111n;
assert(n === 15n);

n = 0B10n;
assert(n === 2n);

binaryString = "0B1";
for (let i = 0; i < 128; i++)
    binaryString += "0";

n = eval(binaryString + "n");
assert(n === 340282366920938463463374607431768211456n);

// Octal representation

n = 0o7n;
assert(n === 7n);

n = 0o10n;
assert(n === 8n);

n = 0o20n;
assert(n === 16n);

n = 0o00020n;
assert(n === 16n);

n = 0O7n;
assert(n === 7n);

n = 0O10n;
assert(n === 8n);

n = 0O20n;
assert(n === 16n);

n = 0O20n;
assert(n === 16n);

// Hexadecimal representation

n = 0xan;
assert(n === 10n);

n = 0xffn;
assert(n === 255n);

n = 0x000ffn;
assert(n === 255n);

n = 0xfabcn;
assert(n === 64188n);

assertThrowSyntaxError("0b2n");
assertThrowSyntaxError("0b02n");
assertThrowSyntaxError("0b1nn");
assertThrowSyntaxError("0o89n");
assertThrowSyntaxError("0o08n");
assertThrowSyntaxError("0o7nn");
assertThrowSyntaxError("0xgn");
assertThrowSyntaxError("0x0gn");
assertThrowSyntaxError("0xfnn");
assertThrowSyntaxError("100nn");
assertThrowSyntaxError("1a0nn");
assertThrowSyntaxError("10E20n");
assertThrowSyntaxError("--10n");
assertThrowSyntaxError("00n");
assertThrowSyntaxError("01n");
assertThrowSyntaxError("09n");
