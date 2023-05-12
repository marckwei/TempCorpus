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

var obj = Object.create({ a: "qux", d: "qux" });
obj.a = "foo"; obj.b = "bar"; obj.c = "baz";
var values = Object.values(obj);
var passed = Array.isArray(values) && String(values) === "foo,bar,baz";

if (!passed)
    throw new Error("Object.values return wrong result.");

var complexObject = {
    obj : {
        a: 'x',
        b: 'y'
    },
    primitive : 'z'
};

passed = false;
values = Object.values(complexObject);

passed = values.length === 2 && values[0].a === 'x' && values[0].b === 'y' && values[1] === 'z';

if (!passed)
    throw new Error("Object.values return wrong result.");

values = Object.values({ a: 'abcdef' });

passed = values.length === 1 && values[0] === 'abcdef';

if (!passed)
    throw new Error("Object.values return wrong result.");

var primitives = [
    ["string", ['s', 't', 'r', 'i', 'n', 'g']],
    [42, []],
    [Symbol("symbol"), []],
    [true, []],
    [false, []]
];

function compare(ax, bx) {
    if (ax.length !== bx.length)
        return false;
    for (var i = 0, iz = ax.length; i < iz; ++i) {
        if (ax[i] !== bx[i])
            return false;
    }
    return true;
}

for (var [primitive, expected] of primitives) {
    var ret = Object.values(primitive);
    if (!compare(ret, expected))
        throw new Error("bad value for " + String(primitive) + ": " + String(ret));
}

[
    [ null, "TypeError: Object.values requires that input parameter not be null or undefined" ],
    [ undefined, "TypeError: Object.values requires that input parameter not be null or undefined" ]
].forEach(function ([value, message]) {
    var error = null;
    try {
        Object.values(value);
    } catch (e) {
        error = e;
    }
    if (!error)
        throw new Error("error not thrown");
    if (String(error) !== message)
        throw new Error("bad error: " + String(error));
});

const getInvokedFunctions = (obj) => {
    let arr = []
    let p = new Proxy(obj, {
        ownKeys: function(...args) {
            arr.push("ownKeys");
            return Reflect.ownKeys(...args);
        },
        getOwnPropertyDescriptor: function(...args) {
            arr.push("getOwnPropertyDescriptor");
            return Reflect.getOwnPropertyDescriptor(...args);
        }
    });

    Object.values(p);
    return arr;
};

const arr1 = getInvokedFunctions({});
passed = arr1.length === 1 && arr1[0] === "ownKeys";

if (!passed)
    throw new Error("Object.values should invoke ownkeys.");

const arr2 = getInvokedFunctions({a:'foo', b:'boo'});
passed = arr2.length === 3 && arr2[0] === "ownKeys";

if (!passed)
    throw new Error("Object.values should invoke ownkeys.");

passed = arr2[1] === "getOwnPropertyDescriptor";

if (!passed)
    throw new Error("Object.values should get property descriptor.");

Array.prototype.push = function () { throw new Error("Array.prototype.push should not be used during invoking of Object.values.")};
Object.getOwnPropertyDescriptor = function () { throw new Error("Array.prototype.getOwnPropertyDescriptor should not be used during invoking of Object.values.")};

values = Object.values({a:'1-2', b:'3-4'});
passed = Array.isArray(values) && String(values) === "1-2,3-4";

if (!passed)
    throw new Error("Object.values return wrong result.");