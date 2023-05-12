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

let warm = 1000;

function foo(f) {
    return f.arguments;
}
noInline(foo);

let caught = 0;

function bar() {
    for (let i = 0; i < warm; ++i)
        foo(bar);
    const x = function baz1() { "use strict"; return 42; };
    const y = function baz2() { "use strict"; return 0xc0defefe; };
    return [x, y];
}

bar();
bar();
const [baz1, baz2] = bar();


if (baz1() !== 42)
    throw new Error(`bad!`);

if (baz2() !== 0xc0defefe)
    throw new Error(`bad!`);

try {
    foo(baz1);
} catch (e) {
    ++caught;
}

try {
    foo(baz2);
} catch (e) {
    ++caught;
}

if (caught !== 2)
    throw new Error(`bad!`);
