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

function assert(a) {
    if (!a)
        throw new Error("Bad Assertion!");
}

class A {
    constructor(prop) {
        this.prop = prop;
    }
    call() {
        return this.prop;
    }
    apply() {
        return this.prop;
    }
}

class B extends A {
  testSuper() {
    assert(super.call() == 'value');
    assert(super.apply() == 'value');
  }
}

const obj = new B('value')
obj.testSuper()

class C {}

class D extends C {
    testSuper() {
        try {
            super.call();
            assert(false);
        } catch(e) {
            assert(e.message == "super.call is not a function. (In 'super.call()', 'super.call' is undefined)");
        }
        
        try {
            super.apply();
            assert(false);
        } catch(e) {
            assert(e.message == "super.apply is not a function. (In 'super.apply()', 'super.apply' is undefined)");
        }
    }
}

let d = new D();
d.testSuper();

