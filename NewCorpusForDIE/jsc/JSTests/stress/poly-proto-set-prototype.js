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

function assert(b) {
    if (!b)
        throw new Error("bad");
}

let alternateProto = {
    get x() {
        return null;
    }
};

let alternateProto2 = {
    get y() { return 22; },
    get x() {
        return null;
    }
};

Object.defineProperty(Object.prototype, "x", {
    get: function() { return this._x; }
});

function foo() {
    class C {
        constructor() {
            this._x = 42;
        }
    };
    return new C;
}

function validate(o, p) {
    assert(o.x === p);
}
noInline(validate);

let arr = [];
foo();
for (let i = 0; i < 25; ++i)
    arr.push(foo());

for (let i = 0; i < 100; ++i) {
    for (let a of arr)
        validate(a, 42);
}

for (let a of arr) {
    a.__proto__ = alternateProto;
}
for (let i = 0; i < 100; ++i) {
    for (let a of arr) {
        validate(a, null);
    }
}

for (let a of arr) {
    a.__proto__ = alternateProto2;
}

for (let i = 0; i < 100; ++i) {
    for (let a of arr) {
        validate(a, null);
        assert(a.y === 22);
    }
}
