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

description("Make sure that we correctly identify parse errors in object literals");

shouldNotThrow("({a:1, get a(){}})");
shouldNotThrow("({a:1, set a(x){}})");
shouldNotThrow("({get a(){}, a:1})");
shouldNotThrow("({set a(x){}, a:1})");
shouldNotThrow("({get a(){}, get a(){}})");
shouldNotThrow("({set a(x){}, set a(x){}})");
shouldNotThrow("({set a(x){}, get a(){}, set a(x){}})");
shouldNotThrow("(function(){({a:1, get a(){}})})");
shouldNotThrow("(function(){({a:1, set a(x){}})})");
shouldNotThrow("(function(){({get a(){}, a:1})})");
shouldNotThrow("(function(){({set a(x){}, a:1})})");
shouldNotThrow("(function(){({get a(){}, get a(){}})})");
shouldNotThrow("(function(){({set a(x){}, set a(x){}})})");
shouldNotThrow("(function(){({set a(x){}, get a(){}, set a(x){}})})");

shouldBeTrue("({a:1, a:1, a:1}), true");
shouldBeTrue("({get a(){}, set a(x){}}), true");
shouldBeTrue("({set a(x){}, get a(){}}), true");
shouldBeTrue("(function(){({a:1, a:1, a:1})}), true");
shouldBeTrue("(function(){({get a(){}, set a(x){}})}), true");
shouldBeTrue("(function(){({set a(x){}, get a(){}})}), true");

shouldNotThrow("({get a(){}})");
shouldNotThrow("({set a(x){}})");
shouldNotThrow("({set a([x, y]){}})");
shouldNotThrow("({set a({x, y}){}})");

shouldThrow("({get a(x){}})");
shouldThrow("({b:1, get a(x){}})");
shouldThrow("({get a([x]){}})");
shouldThrow("({get a({x}){}})");
shouldThrow("({set a(){}})");
shouldThrow("({b:1, set a(){}})");
shouldThrow("({set a(){}})");
shouldThrow("({set a(x{}})");
shouldThrow("({set a({}})");
shouldThrow("({set a((x)){}})");
shouldThrow("({set a(x, y){}})");
shouldThrow("({set a([x], y){}})");
shouldThrow("({set a({x}, y){}})");
