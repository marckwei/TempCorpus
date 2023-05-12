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

function bar() {
    return {f:42};
}

noInline(bar);

function foo0(b) {
    var o = {f:42};
    if (b) {
        var p = bar();
        p.g = o;
        return p;
    }
}

function foo1(b) {
    var o = {f:42};
    if (b) {
        var p = bar();
        p.f1 = 1;
        p.g = o;
        return p;
    }
}

function foo2(b) {
    var o = {f:42};
    if (b) {
        var p = bar();
        p.f1 = 1;
        p.f2 = 2;
        p.g = o;
        return p;
    }
}

function foo3(b) {
    var o = {f:42};
    if (b) {
        var p = bar();
        p.f1 = 1;
        p.f2 = 2;
        p.f3 = 3;
        p.g = o;
        return p;
    }
}

function foo4(b) {
    var o = {f:42};
    if (b) {
        var p = bar();
        p.f1 = 1;
        p.f2 = 2;
        p.f3 = 3;
        p.f4 = 4;
        p.g = o;
        return p;
    }
}

noInline(foo0);
noInline(foo1);
noInline(foo2);
noInline(foo3);
noInline(foo4);

var array = new Array(1000);
for (var i = 0; i < 400000; ++i) {
    var o = foo0(true);
    array[i % array.length] = o;
}
for (var i = 0; i < 400000; ++i) {
    var o = foo1(true);
    array[i % array.length] = o;
}
for (var i = 0; i < 400000; ++i) {
    var o = foo2(true);
    array[i % array.length] = o;
}
for (var i = 0; i < 400000; ++i) {
    var o = foo3(true);
    array[i % array.length] = o;
}
for (var i = 0; i < 400000; ++i) {
    var o = foo4(true);
    array[i % array.length] = o;
}

