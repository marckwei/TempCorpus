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

//@ requireOptions("--forcePolyProto=1")
function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

function test(object) {
    var result = []
    for (var k in object)
        result.push(k);
    return JSON.stringify(result);
}
noInline(test);

var constructors = []
Object.prototype.hey = 32;
function factory() {
    function Test() { }
    constructors.push(Test);
    return new Test;
}

var object = factory();
shouldBe(test(object), `["hey"]`);
shouldBe(test(object), `["hey"]`);
shouldBe(test(object), `["hey"]`);
var object2 = factory();
shouldBe(test(object2), `["hey"]`);
shouldBe(test(object2), `["hey"]`);
shouldBe(test(object2), `["hey"]`);
object2.__proto__ = { ok: 33 };
shouldBe(test(object2), `["ok","hey"]`);
shouldBe(test(object2), `["ok","hey"]`);
shouldBe(test(object2), `["ok","hey"]`);
