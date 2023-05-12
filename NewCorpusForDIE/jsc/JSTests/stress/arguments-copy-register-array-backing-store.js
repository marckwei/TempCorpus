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

var foo = function(o) {
    return arguments;
};

var bar = function() {
    var a = Array.prototype.slice.call(arguments);
    var sum = 0;
    for (var i = 0; i < a.length; ++i)
        sum += a[i];
    return sum;
};

var args = foo({}, 1, 2, 3);
var expectedArgs = Array.prototype.slice.call(args);

edenGC();

var expectedResult = 0;
var result = 0;
for (var i = 0; i < 10000; ++i) {
    expectedResult += i + i + 1 + i + 2;
    result += bar(i, i + 1, i + 2);
}

if (result != expectedResult)
    throw new Error("Incorrect result: " + result + " != " + expectedResult);

for (var i = 0; i < expectedArgs.length; ++i) {
    if (args[i] !== expectedArgs[i])
        throw new Error("Incorrect arg result");
}
    
