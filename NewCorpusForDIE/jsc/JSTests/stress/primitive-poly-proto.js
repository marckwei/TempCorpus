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

let y = 42;
function makePolyProtoInstance() {
    function foo() {
        class C {
            constructor() { this.x = 20; }
        };
        C.prototype.y = y;
        return new C;
    }

    for (let i = 0; i < 5; ++i)
        foo();
    return foo();
}

let polyProtoInstance = makePolyProtoInstance();
String.prototype.__proto__ = polyProtoInstance;
Symbol.prototype.__proto__ = polyProtoInstance;
let strings = [
    "foo",
    Symbol("foo"),
    "bar",
    Symbol("bar"),
];

function assert(b) {
    if (!b)
        throw new Error("Bad asssertion")
}
noInline(assert);

function validate(s) {
    assert(s.x === 20);
    assert(s.y === y);
    assert(s.nonExistentProperty === undefined);
    assert(typeof s.hasOwnProperty === "function");
    assert(s.hasOwnProperty === Object.prototype.hasOwnProperty);
}
noInline(validate);

for (let i = 0; i < 1000; ++i) {
    for (let s of strings) {
        validate(s);
    }
}

y = 27;
polyProtoInstance.__proto__ = {z:400, y: y};
for (let i = 0; i < 1000; ++i) {
    for (let s of strings) {
        validate(s);
    }
}
