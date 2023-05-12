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

let called = false;
function makePolyProtoObject() {
    function foo() {
        class C {
            constructor() 
            {
                this._p = null;
            }

            set p(x)
            {
                called = true;
                this._p = x;
            }
            get p()
            {
                return this._p;
            }
        };
        return new C;
    }
    for (let i = 0; i < 15; ++i) {
        assert(foo().p === null);
    }
    return foo();
}

function performSet(o) {
    o.p = 20;
}

let items = [];
for (let i = 0; i < 20; ++i) {
    items.push(makePolyProtoObject());
}

function performSet(x, i) {
    x.p = i;
}

let start = Date.now();
for (let i = 0; i < 100000; ++i) {
    for (let i = 0; i < items.length; ++i) {
        let o = items[i];
        performSet(o, i);
        assert(o._p === i);
        assert(called === true);
        called = false;
    }
}

items.forEach(o => {
    Reflect.setPrototypeOf(o, null);
});

for (let i = 0; i < 100000; ++i) {
    for (let i = 0; i < items.length; ++i) {
        let o = items[i];
        performSet(o, i);
        assert(o.p === i);
        assert(called === false);
    }
}

if (false)
    print(Date.now() - start);
