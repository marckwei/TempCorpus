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

var testCase = function (actual, expected, message) {
    if (actual !== expected) {
        throw message + ". Expected '" + expected + "', but was '" + actual + "'";
    }
};

var deepScope = function (x, y) {
    var _x = x, _y = y;
    return ()=> _x + _y + this.val;
};

var a = deepScope.call({val:'A'}, 'D', 'E');
var b = deepScope.call({val:'B'}, 'D', 'F');
var c = deepScope.call({val:'C'}, 'D', 'G');

var anotherScope = function (_af) {
    return _af();
};

for (var i = 0; i < 1000; i++) {
    testCase(c(), anotherScope.call({val:'I'}, c), "Error: this is not lexically binded inside of the arrow function #1");
    testCase(b(), anotherScope.call({val:'J'}, b), "Error: this is not lexically binded inside of the arrow function #2");
    testCase(a(), anotherScope.call({val:'K'}, a), "Error: this is not lexically binded inside of the arrow function #3");
}
