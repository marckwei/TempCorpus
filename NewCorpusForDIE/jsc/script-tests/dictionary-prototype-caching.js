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

description("Test to ensure correct behaviour of prototype caching with dictionary prototypes");

function protoTest(o) {
    return o.protoProp;
}

var proto = {protoProp: "PASS", propToRemove: "foo"};
var o = { __proto__: proto };

delete proto.propToRemove;

// Prototype lookup caching will attempt to convert proto back to an ordinary structure
protoTest(o);
protoTest(o);
protoTest(o);
shouldBe("protoTest(o)", "'PASS'");
delete proto.protoProp;
proto.fakeProtoProp = "FAIL";
shouldBeUndefined("protoTest(o)");

function protoTest2(o) {
    return o.b;
}

var proto = {a:1, b:"meh", c:2};
var o = { __proto__: proto };

delete proto.b;
proto.d = 3;
protoTest2(o);
protoTest2(o);
protoTest2(o);
var protoKeys = [];
for (var i in proto)
    protoKeys.push(proto[i]);

shouldBe("protoKeys", "[1,2,3]");

function protoTest3(o) {
    return o.b;
}

var proto = {a:1, b:"meh", c:2};
var o = { __proto__: proto };

delete proto.b;
protoTest2(o);
protoTest2(o);
protoTest2(o);
proto.d = 3;
var protoKeys = [];
for (var i in proto)
    protoKeys.push(proto[i]);

shouldBe("protoKeys", "[1,2,3]");

function testFunction(o) {
    return o.test;
}

var proto = { test: true };
var subclass1 = { __proto__: proto };
var subclass2 = { __proto__: proto };
for (var i = 0; i < 500; i++)
    subclass2["a"+i]="a"+i;

testFunction(subclass1);
shouldBeTrue("testFunction(subclass1)");
shouldBeTrue("testFunction(subclass2)");
proto.test = false
subclass2.test = true;
shouldBeTrue("testFunction(subclass2)");
