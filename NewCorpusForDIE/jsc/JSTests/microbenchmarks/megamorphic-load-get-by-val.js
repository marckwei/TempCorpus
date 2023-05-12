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

function f(arr, keys) {
    var res = 0;
    for (var i=0; i<10000000; i++) {
        var o = arr[i % arr.length];
        if (o[keys[i & 0x7]])
            res = 1;
    }
    return res;
}
noInline(f);

var arr = [];
var keys = ['someprop0', 'someprop1', 'someprop2', 'someprop3', 'someprop4', 'someprop5', 'someprop6', 'someprop7' ];

for (var i=0; i<40; i++) {
    var o = {};
    o.someprop0 = 42;
    o.someprop1 = 42;
    o.someprop2 = 42;
    o.someprop3 = 42;
    o.someprop4 = 42;
    o.someprop5 = 42;
    o.someprop6 = 42;
    o.someprop7 = 42;
    o["a" + i] = i;
    arr.push(o);
}

f(arr, keys);
