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

function assert(a, message) {
    if (!a)
        throw new Error(message);
}

function shallowEquals(a, b) {
    if (Array.isArray(a) !== Array.isArray(b))
        return false;
    if (Array.isArray(a)) {
        let aLen = a.length | 0;
        let bLen = a.length | 0;
        if (aLen === bLen) {
            for (let i = 0; i < aLen; ++i) {
                if (a[i] !== b[i])
                    return false;
            }
            return true;
        }
    }
    return a === b;
}

assert.same = function(a, b, message) {
    let msg = message ? `. ${message}` : "";
    assert(shallowEquals(a, b), `Expected ${a} to equal ${b}${msg}`);
}

assert.not = function(a, message) {
    assert(!a, message);
}

function makeComputedKey(options = {}) {
    let { toString, valueOf, toPrimitive } = options;
    let hasToPrimitive = options.hasOwnProperty("toPrimitive");
    function toPrimitiveFn() {
        order.push(`call @@toPrimitive() -> ${toPrimitive}`);
        return toPrimitive;
    }

    function toStringFn() {
        order.push(`call toString() -> ${toString}`);
        return toString;
    }

    function valueOfFn() {
        order.push(`call valueOf() -> ${valueOf}`);
        return valueOf;
    }

    return {
        get [Symbol.toPrimitive]() {
            order.push(`load @@toPrimitive`);
            this.toPrimitiveLoaded++;
            return hasToPrimitive ? toPrimitiveFn : void 0;
        },
        get toString() {
            order.push(`load toString`);
            return toStringFn;
        },
        get valueOf() {
            order.push(`load valueOf`);
            return valueOfFn;
        },
    };
}

let object = { toString() { return "object"; } };
let order = [];
class Base {
    constructor() {
        order.push("construct Base");
        return new Proxy(this, {
            defineProperty(target, p, desc) {
                order.push(`defineProperty ${p}`);
                return Reflect.defineProperty(target, p, desc);
            }
        });
    }
}

let computedKey = makeComputedKey({ toString: "test" });
assert.same(order, []);
class BasicTPK extends Base {
    [computedKey] = "basic";
}

assert.same(order, ["load @@toPrimitive", "load toString", "call toString() -> test"]);
order.length = 0;
let instance = new BasicTPK;
assert.same(order, ["construct Base", "defineProperty test"]);
assert.same(instance.test, "basic");

// The computed key is evaluated during class evaluation, not initialization
order.length = 0;
computedKey = makeComputedKey({ toString: object, valueOf: null });
instance = new BasicTPK;
assert.same(instance.test, "basic");
assert.not(instance.hasOwnProperty("null"));
assert.same(order, ["construct Base", "defineProperty test"]);

order.length = 0;
class BasicTPK2 extends Base {
    [computedKey] = "valueOf";
}
instance = new BasicTPK2;
assert.not(instance.hasOwnProperty("test"));
assert.same(instance.null, "valueOf");
assert.same(order, [
    "load @@toPrimitive",
    "load toString",
    "call toString() -> object",
    "load valueOf",
    "call valueOf() -> null",
    "construct Base",
    "defineProperty null"
]);

// exoticToPrimitive
order.length = 0;
computedKey = makeComputedKey({ toPrimitive: "bingo" });
class ExoticTPK {
    [computedKey] = "exotic";
}

assert.same(order, ["load @@toPrimitive", "call @@toPrimitive() -> bingo"]);
order.length = 0;
instance = new ExoticTPK;
assert.same(order, ["construct Base", "defineProperty bingo"]);
assert.same(instance.bingo, "exotic");
