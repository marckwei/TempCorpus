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

var a = [ "String", false, 42 ];
var count = 0;

function getX(fromDFG) {
    if (fromDFG)
        return 42;
    return false;
}

noInline(getX);

function foo(index) {
    var result = false;
    var x = getX($vm.dfgTrue());

    x * 2;

    var y = a[index % a.length];
    result = y === x;
    count += 1;
    return result;
}

noInline(foo);

var loopCount = 10000;

function bar() {
    var result;

    for (var i = 0; i < loopCount - 1; i++)
        result = foo(i)

    result = foo(0);

    return result;
}

var result = bar();
if (result != false)
    throw "Error: bad result expected false: " + result;
if (count != loopCount)
    throw "Error: bad count, expected: " + loopCount + ", got: " + count;
