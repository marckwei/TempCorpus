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

// this test checks that register r9 is not a callee save on ios armv7.
function ident(a) { 
    return a; 
}

function foo(array,obj) { 
    var a = array[0]; 
    var b = array[1]; 
    var c = array[2]; 
    obj.a = array;
    obj.b = array;
    obj.c = array;
    obj.d = array;
    obj.e = array;
    obj.f = array;
    obj.h = array;
    return a(b(c(10)));
}
noInline(foo);

var arr = [ident,ident,ident];

for (var i = 0; i < 100; i++) {
    var obj = {};
    for (var j = 0; j < 200; j ++) {
        obj["j"+j] = i;
    }
    foo(arr, obj);
}

for (var i = 0; i < 100; i++) {
    var obj = {};
    foo(arr, obj);
}