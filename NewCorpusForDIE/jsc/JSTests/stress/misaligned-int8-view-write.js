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

function make(offset) {
    // Default offset is 1.
    if (offset === void 0)
        offset = 1;
    
    var int8Array = new Int8Array(100);
    for (var i = 0; i < int8Array.length; ++i)
        int8Array[i] = i;

    return new Int8Array(int8Array.buffer, offset, int8Array.length - offset);
}
noInline(make);

function foo(o, i, v) {
    o[i] = v;
}

noInline(foo);

var o = make();
var real = new Int8Array(o.buffer);
for (var i = 0; i < 10000; ++i) {
    var index = i % o.length;
    var value = i % 7;
    foo(o, index, value);
    var result = real[index + 1];
    if (result != value)
        throw "Write test error: bad result for index = " + index + ": " + result + "; expected " + value;
}

