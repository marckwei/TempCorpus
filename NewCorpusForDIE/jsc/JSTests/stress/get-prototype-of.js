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

function assert(x) {
    if (!x)
        throw Error("Bad");
}

function shouldThrow(func, errorMessage) {
    var errorThrown = false;
    var error;
    try {
        func();
    } catch (e) {
        errorThrown = true;
        error = e;
    }
    if (!errorThrown)
        throw new Error("Not thrown");
    if (String(error) !== errorMessage)
        throw new Error(`Bad error: ${error}`);
}

function makePolyProtoObject() {
    function foo() {
        class C {
            constructor() {
                this._field = 42;
            }
        }
        return new C();
    }
    for (let i = 0; i < 1000; ++i)
        foo();
    return foo();
}

const getPrototypeOf = $vm.createBuiltin("(function (v) { return @getPrototypeOf(v); })");
noInline(getPrototypeOf);

const proxyPrototype = {};
const proxy = new Proxy({}, {
    getPrototypeOf: () => proxyPrototype,
});

const polyProtoObject = makePolyProtoObject();

for (let i = 0; i < 1e4; ++i) {
    shouldThrow(() => getPrototypeOf(undefined), "TypeError: undefined is not an object");
    shouldThrow(() => getPrototypeOf(null), "TypeError: null is not an object");

    assert(getPrototypeOf(true) === Boolean.prototype);
    assert(getPrototypeOf(1) === Number.prototype);
    assert(getPrototypeOf("foo") === String.prototype);
    assert(getPrototypeOf(Symbol()) === Symbol.prototype);
    assert(getPrototypeOf(10n) === BigInt.prototype);

    assert(getPrototypeOf({}) === Object.prototype);
    assert(getPrototypeOf([]) === Array.prototype);
    assert(getPrototypeOf(() => {}) === Function.prototype);

    assert(getPrototypeOf(Object.prototype) === null);
    assert(getPrototypeOf(Object.create(null)) === null);

    assert(getPrototypeOf(proxy) === proxyPrototype);
    assert(getPrototypeOf(polyProtoObject) === polyProtoObject.constructor.prototype);
}
