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

function makePolyProtoInstanceWithNullPrototype() {
    function foo() {
        class C {
            constructor() { this.x = 20; }
        };
        C.prototype.y = 42;
        let result = new C;
        return result;
    }

    for (let i = 0; i < 5; ++i)
        foo();
    let result = foo();
    result.__proto__ = null;
    return result;
}

function assert(b) {
    if (!b)
        throw new Error("Bad asssertion")
}

let instances = [
    makePolyProtoInstanceWithNullPrototype(),
    makePolyProtoInstanceWithNullPrototype(),
    makePolyProtoInstanceWithNullPrototype(),
    makePolyProtoInstanceWithNullPrototype(),
    makePolyProtoInstanceWithNullPrototype(),
    makePolyProtoInstanceWithNullPrototype(),
    makePolyProtoInstanceWithNullPrototype(),
    makePolyProtoInstanceWithNullPrototype(),
    makePolyProtoInstanceWithNullPrototype(),
    makePolyProtoInstanceWithNullPrototype(),
    makePolyProtoInstanceWithNullPrototype(),
    makePolyProtoInstanceWithNullPrototype(),
];

let p = undefined;
function validate(x) {
    assert(x.x === 20);
    assert(x.p === undefined);
}
noInline(validate);

let start = Date.now();
for (let i = 0; i < 100000; ++i) {
    for (let i = 0; i < instances.length; ++i)
        validate(instances[i]);
}
if (false)
    print(Date.now() - start);
