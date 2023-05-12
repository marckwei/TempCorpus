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
        throw new Error('bad value: ' + actual);
}

function test(i)
{
    class A {
        #field = 0;
        put(i)
        {
            this.#field = i;
        }
        get()
        {
            return this.#field;
        }
    }
    noInline(A.prototype.get);
    noInline(A.prototype.put);
    return new A;
}

let test0 = test(0);
let test1 = test(1);
let test2 = test(2);
let test3 = test(3);
let test4 = test(4);

for (var i = 0; i < 1e5; ++i) {
    test0.put(i + 0);
    shouldBe(test0.get(), i + 0);
    test1.put(i + 1);
    shouldBe(test1.get(), i + 1);
    test2.put(i + 2);
    shouldBe(test2.get(), i + 2);
    test3.put(i + 3);
    shouldBe(test3.get(), i + 3);
    test4.put(i + 4);
    shouldBe(test4.get(), i + 4);
}
