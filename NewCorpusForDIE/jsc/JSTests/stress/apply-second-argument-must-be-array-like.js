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

//@ runDefault

function assert(x) {
    if (!x)
        throw Error("Bad");
}

function shouldThrow(expr) {
    let testFunc = new Function(expr);
    for (let i = 0; i < 10000; i++) {
        let error;
        try {
            testFunc();
        } catch (e) {
            error = e;
        }
        assert(error);
    }
}

function foo() { }

shouldThrow("foo.apply(undefined, true)");
shouldThrow("foo.apply(undefined, false)");
shouldThrow("foo.apply(undefined, 100)");
shouldThrow("foo.apply(undefined, 123456789.12345)");
shouldThrow("foo.apply(undefined, 1.0/1.0)");
shouldThrow("foo.apply(undefined, 1.0/0)");
shouldThrow("foo.apply(undefined, 'hello')");
shouldThrow("foo.apply(undefined, Symbol())");

function bar() {
    return arguments.length;
}

for (let i = 0; i < 10000; i++) {
    new Function(`
        assert(bar.apply(undefined, undefined) === 0);
        assert(bar.apply(undefined, null) === 0);
        assert(bar.apply(undefined, {}) === 0);
        assert(bar.apply(undefined, []) === 0);
        assert(bar.apply(undefined, function() {}) === 0);
    `)();
}
