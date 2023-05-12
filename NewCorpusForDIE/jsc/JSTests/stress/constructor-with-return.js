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

function Test(value, returnIt) {
    this.value = value;
    this.returnIt = returnIt;
}

var tests = [
    new Test("string", false),
    new Test(5, false),
    new Test(6.5, false),
    new Test(void(0), false),
    new Test(null, false),
    new Test(true, false),
    new Test(false, false),
    new Test(Symbol.iterator, false),
    new Test({f:42}, true),
    new Test([1, 2, 3], true),
    new Test(new String("string"), true),
    new Test(new Number(42), true),
    new Test(new Boolean(false), true),
    new Test(new Boolean(false), true),
    new Test(Object(Symbol.iterator), true),
];

for (let i = 0; i < 1000; ++i) {
    tests.forEach(function (test) {
        function Constructor() {
            return test.value;
        }

        var result = new Constructor();
        if (test.returnIt) {
            if (test.value !== result) {
                throw "Bad result: " + result;
            }
        } else {
            if (!(result instanceof Constructor)) {
                throw "Bad result: " + result;
            }
        }
    });
}
