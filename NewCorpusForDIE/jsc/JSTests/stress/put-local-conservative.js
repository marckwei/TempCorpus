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

function foo(o, a, b, c) {
    // Don't do anything real but have some control flow. This causes the PutLocals for a,
    // b, and c to survive into SSA form. But we don't have any effects, so sinking will be
    // successful.
    if (o.f)
        return 42;
    else
        return 0;
}

function bar(o, y) {
    var a = y;
    var b = y + 1;
    var c = y + 2;
    var d = y + 3;
    var e = y + 4;
    var f = y + 5;
    var g = y + 6;
    var h = y + 7;
    var i = y + 8;
    var j = y + 9;
    var k = y + 10;
    var result = function(p, q) {
        var x = a + b + c + d + e + f + g + h + i + j + k;
        if (q) {
            // Make it appear that it's possible to clobber those closure variables, so that we
            // load from them again down below.
            a = b = c = d = e = f = g = h = i = j = k = 42;
        }
        if (p)
            x = foo(o, 1, 2, 3)
        else
            x = 5;
        return x + a + b + c + d + e + f + g + h + i + j + k;
    };
    noInline(result);
    return result;
}

var o = {f: 42};

for (var i = 0; i < 100000; ++i) {
    var result = bar(o, i)(true, false);
    if (result != 42 + 11 * i + 55)
        throw "Error: bad result: " + result;
}

