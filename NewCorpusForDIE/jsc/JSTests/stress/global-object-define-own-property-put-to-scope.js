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

function shouldThrow(func, expectedMessage) {
    var errorThrown = false;
    try {
        func();
    } catch (error) {
        errorThrown = true;
        if (String(error) !== expectedMessage)
            throw new Error(`Bad error: ${error}`)
    }
    if (!errorThrown)
        throw new Error("Didn't throw!");
}

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error(`Bad value: ${actual}!`);
}

var foo = 1;
eval("var bar");
function func() {}

shouldBe(Object.getOwnPropertyDescriptor(globalThis, "foo").value, 1);
shouldBe(Object.getOwnPropertyDescriptor(globalThis, "bar").value, undefined);
shouldBe(typeof Object.getOwnPropertyDescriptor(globalThis, "func").value, "function");

foo = 2;
bar = 2;
func = 2;

shouldBe(Object.getOwnPropertyDescriptor(globalThis, "foo").value, 2);
shouldBe(Object.getOwnPropertyDescriptor(globalThis, "bar").value, 2);
shouldBe(Object.getOwnPropertyDescriptor(globalThis, "func").value, 2);

foo = 3;
bar = 3;
func = 3;

Object.defineProperty(globalThis, "foo", { value: 4 });
Object.defineProperty(globalThis, "bar", { value: 4 });
Object.defineProperty(globalThis, "func", { value: 4 });

shouldBe(foo, 4);
shouldBe(bar, 4);
shouldBe(func, 4);

Object.defineProperty(globalThis, "foo", { writable: false });
Object.defineProperty(globalThis, "bar", { writable: false });
Object.defineProperty(globalThis, "func", { writable: false });

foo = 5;
bar = 5;
func = 5;

shouldBe(foo, 4);
shouldBe(bar, 4);
shouldBe(func, 4);

shouldThrow(() => { "use strict"; foo = 4; }, "TypeError: Attempted to assign to readonly property.");
shouldThrow(() => { "use strict"; bar = 4; }, "TypeError: Attempted to assign to readonly property.");
shouldThrow(() => { "use strict"; func = 4; }, "TypeError: Attempted to assign to readonly property.");

eval("var x = 1");
var y = 1;
function setVars(val) { x = val; y = val; }
noInline(setVars);
const writableThreshold = 9e6;

for (let i = 0; i < 10e6; i++) {
    setVars(i);

    if (i < writableThreshold) {
        shouldBe(x, i);
        shouldBe(y, i);
    } else if (i === writableThreshold) {
        Object.defineProperty(globalThis, "x", { writable: false });
        Object.defineProperty(globalThis, "y", { writable: false });
    } else {
        shouldBe(x, writableThreshold);
        shouldBe(y, writableThreshold);
    }
}

shouldThrow(() => { "use strict"; x = writableThreshold; }, "TypeError: Attempted to assign to readonly property.");
shouldThrow(() => { "use strict"; y = writableThreshold; }, "TypeError: Attempted to assign to readonly property.");
