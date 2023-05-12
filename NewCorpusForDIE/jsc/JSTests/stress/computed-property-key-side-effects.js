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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error(`expected ${expected} but got ${actual}`);
}

let count;
const key1 = { toString() { count++; return 'foo'; } };
const key2 = { toString: null, valueOf() { count++; return 'foo'; } };

function test() {
  count = 0;

  ({ [key1]() { return 'bar'; } });
  shouldBe(count, 1);
  ({ [key1]: function () { return 'bar'; } });
  shouldBe(count, 2);
  ({ [key1]: () => 'bar' });
  shouldBe(count, 3);
  ({ get [key1]() { return 'bar'; } });
  shouldBe(count, 4);
  ({ set [key1](_) {} });
  shouldBe(count, 5);

  ({ [key2]() { return 'bar'; } });
  shouldBe(count, 6);
  ({ [key2]: function () { return 'bar'; } });
  shouldBe(count, 7);
  ({ [key2]: () => 'bar' });
  shouldBe(count, 8);
  ({ get [key2]() { return 'bar'; } });
  shouldBe(count, 9);
  ({ set [key2](_) {} });
  shouldBe(count, 10);
}
noInline(test);

for (let i = 0; i < 1e5; i++)
  test();
