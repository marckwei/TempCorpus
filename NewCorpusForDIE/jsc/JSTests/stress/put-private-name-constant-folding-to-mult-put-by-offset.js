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

//@ requireOptions("--usePolymorphicAccessInlining=false")

let assert = {
    sameValue: function (a, e) {
       if (a !== e) 
        throw new Error("Expected: " + e + " but got: " + a);
    }
}

let iterations = 100000;
let triggerCompilation = false;
let constructDifferent = false;
class C {
    #field = this.init();

    init() {
        if (constructDifferent)
            this.foo = 0;
        return 0;
    }

    method(j, other) {
        let c = 0;
        let obj = this;
        for (let i = 0; triggerCompilation && i < iterations; i++)
            c++;
        if (j % 2) {
            other.foo = j;
            obj = other;
        }
        obj.#field = c;
    }

    getField() {
        return this.#field;
    }
}
noInline(C.prototype.method);
noInline(C.prototype.getField);
noDFG(C.prototype.getField);
noFTL(C.prototype.getField);

let otherC = new C();

constructDifferent = true;

for (let i = 0; i < 30; i++) {
    let c = new C();
    c.method(i, otherC);
    assert.sameValue(c.getField(), 0);
}

triggerCompilation = true
let c = new C();
c.method(0, otherC);
assert.sameValue(c.getField(), iterations);

