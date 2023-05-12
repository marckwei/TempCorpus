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

function shouldThrow(func, errorMessage) {
    var errorThrown = false;
    var error = null;
    try {
        func();
    } catch (e) {
        errorThrown = true;
        error = e;
    }
    if (!errorThrown)
        throw new Error('not thrown');
    if (String(error) !== errorMessage)
        throw new Error(`bad error: ${String(error)}`);
}

function defineCGetter(obj) {
    Reflect.defineProperty(obj, "c", {
        get: function() { return 'defineCGetter'; }
    });
}

class A {
    b = defineCGetter(this);
    c = 42;
};
shouldThrow(() => new A(), `TypeError: Attempting to change configurable attribute of unconfigurable property.`);

let key = 'c';
class B {
    b = defineCGetter(this);
    [key] = 42;
};
shouldThrow(() => new B(), `TypeError: Attempting to change configurable attribute of unconfigurable property.`);

function define0Getter(obj) {
    Reflect.defineProperty(obj, "0", {
        get: function() { return 'defineCGetter'; }
    });
}
class C {
    b = define0Getter(this);
    [0] = 42;
};
shouldThrow(() => new C(), `TypeError: Attempting to change configurable attribute of unconfigurable property.`);

class D {
    b = Object.freeze(this);
    [0] = 42;
};
shouldThrow(() => new D(), `TypeError: Attempting to define property on object that is not extensible.`);
