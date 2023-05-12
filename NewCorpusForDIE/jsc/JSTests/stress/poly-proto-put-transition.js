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

function assert(b, m) {
    if (!b)
        throw new Error("Bad:" + m);
}

function makePolyProtoObject() {
    function foo() {
        class C {
            constructor() {
                this._field = 42;
            }
        };
        return new C;
    }
    for (let i = 0; i < 15; ++i)
        foo();
    return foo();
}

let global;

function performSet(o) {
    o.p = 20;
}

let start = Date.now();
for (let i = 0; i < 1000; ++i) {
    let obj = makePolyProtoObject();
    obj.__proto__ = null;
    performSet(obj);
    assert(Object.hasOwnProperty.call(obj, "p"));
    assert(obj.p === 20);

}

for (let i = 0; i < 1000; ++i) {
    let obj = makePolyProtoObject();
    obj.__proto__ = { set p(x) { global = x; } };
    performSet(obj);
    assert(!obj.hasOwnProperty("p"));
    assert(global === 20);
    global = null;
}

for (let i = 0; i < 1000; ++i) {
    let obj = makePolyProtoObject();
    performSet(obj);
    assert(obj.hasOwnProperty("p"));
    assert(obj.p === 20);
}
if (false)
    print(Date.now() - start);
