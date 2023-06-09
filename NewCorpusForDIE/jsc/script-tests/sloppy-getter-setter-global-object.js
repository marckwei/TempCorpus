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

description(
"Tests that check that sloppy getters and setters on the global object don't coerce undefined to their this."
);

var act_e = undefined;
try { 
    this.__proto__;
    var originalProto = this.__proto__;
    this.__proto__ = 1;
    if (this.__proto__ != originalProto) 
        throw "__proto__ was modified";
} catch (e) {
    act_e = e;
}

if (act_e) 
    testFailed("shouldn't have thrown '"+ e + "' when accessing and modifying this.__proto__");
else 
    testPassed("this.__proto__ accessed succesfully and stayed frozen.");

shouldNotThrow("Object.prototype.valueOf.call(3);");
shouldThrow("Object.prototype.valueOf.call(null);");


shouldNotThrow("Object.getOwnPropertyDescriptor(Object.prototype,'__proto__').get()");
shouldNotThrow("Object.getOwnPropertyDescriptor(Object.prototype,'__proto__').set(['foo'])");

shouldThrow("(0,Object.getOwnPropertyDescriptor(Object.prototype,'__proto__').get)()", "\"TypeError: undefined is not an object (evaluating '(0,Object.getOwnPropertyDescriptor(Object.prototype,'__proto__').get)()')\"");
shouldThrow("(0,Object.getOwnPropertyDescriptor(Object.prototype,'__proto__').set)(['foo'])", "\"TypeError: Object.prototype.__proto__ called on null or undefined\"");


var top_level_sloppy_getter = Object.getOwnPropertyDescriptor(Object.prototype,'__proto__').get;
shouldThrow("top_level_sloppy_getter();", "\"TypeError: undefined is not an object (evaluating 'top_level_sloppy_getter()')\"");

var top_level_sloppy_setter = Object.getOwnPropertyDescriptor(Object.prototype,'__proto__').set;
shouldThrow("top_level_sloppy_setter(['foo']);", "\"TypeError: Object.prototype.__proto__ called on null or undefined\"");
