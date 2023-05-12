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

function foo(a, b) {
    return a + b;
}
noInline(foo);

function bar() {
    return foo.apply(this, arguments);
}

function fuzz(a, b, c, d, e, f) {
    return a + b + c + d + e + f;
}
noInline(fuzz);

function baz(array) {
    var a = array[0];
    var b = array[1];
    var c = array[2];
    var d = array[3];
    var e = array[4];
    var f = array[5];
    var g = array[6];
    var h = array[7];
    var i = array[8];
    var j = array[9];
    
    var x = bar(a, b);
    var y = fuzz(a, b, c, d, e, f);
    
    return a + b + c + d + e + f + g + h + i + j + x + y;
}

noInline(baz);

for (var i = 0; i < 10000; ++i) {
    var result = baz([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    if (result != 61)
        throw "Error: bad result: " + result;
}

