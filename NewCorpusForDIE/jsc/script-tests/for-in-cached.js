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
"This tests that for/in statements behave correctly when cached."
);

function forIn1() {
    var result = [];
    var o = { x: 1 };
    for (var p in o)
        result.push(p);
    return result;
}
forIn1();
Object.prototype.y = 2;
shouldBe("forIn1()", "['x', 'y']");
delete Object.prototype.y;

function forIn2() {
    var result = [];
    var o = { x: 1, __proto__: null };
    for (var p in o)
        result.push(p);
    return result;
}
forIn2();
shouldBe("forIn2()", "['x']");

function forIn3(proto) {
    var result = [];
    var o = { x: 1, __proto__: proto };
    for (var p in o)
        result.push(p);
    return result;
}
forIn3({ __proto__: { y1: 2 } });
forIn3({ __proto__: { y1: 2 } });
shouldBe("forIn3({ __proto__: { y1: 2 } })", "['x', 'y1']");

forIn3({ y2 : 2, __proto__: null });
forIn3({ y2 : 2, __proto__: null });
shouldBe("forIn3({ y2 : 2, __proto__: null })", "['x', 'y2']");

forIn3({ __proto__: { __proto__: { y3 : 2 } } });
forIn3({ __proto__: { __proto__: { y3 : 2 } } });
shouldBe("forIn3({ __proto__: { __proto__: { y3 : 2 } } })", "['x', 'y3']");

function forIn4(o) {
    var result = [];
    for (var p in o)
        result.push(p);
    return result;
}
var objectWithArrayAsProto = {};
objectWithArrayAsProto.__proto__ = [];
shouldBe("forIn4(objectWithArrayAsProto)", "[]");
objectWithArrayAsProto.__proto__[0]=1;
shouldBe("forIn4(objectWithArrayAsProto)", "['0']");

function forIn5(o) {
    for (var i in o)
        return [i, o[i]];
}

shouldBe("forIn5({get foo() { return 'called getter'} })", "['foo', 'called getter']");
shouldBe("forIn5({set foo(x) { } })", "['foo', undefined]");
shouldBe("forIn5({get foo() { return 'called getter'}, set foo(x) { }})", "['foo', 'called getter']");

function cacheClearing() {
    for(var j=0; j < 10; j++){
        var o = {a:1,b:2,c:3,d:4,e:5}
        try {for (i in o) { delete o.a; o = null; throw "" };}finally{continue}
    }
}

cacheClearing()
