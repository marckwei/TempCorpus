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
        throw new Error;
}

const GeneratorFunction = (function* () {}).constructor;

function test1(f) {
    f.__proto__ = {};
    assert(!f.hasOwnProperty("caller"));
    Object.defineProperty(f, "caller", {value:42});
    assert(f.caller === 42);
    assert(!f.hasOwnProperty("arguments"));
    Object.defineProperty(f, "arguments", {value:32});
    assert(f.arguments === 32);
}
for (let i = 0; i < 1000; ++i) {
    test1(function () {}.bind());
    test1(function () { "use strict"; });
    test1(new Function(`"use strict";`));
    test1(new GeneratorFunction);
    test1(class C { });
    test1(() => undefined);
    test1(async function foo(){});
    test1(function* foo() { });
}

function test2(f, p = {}) {
    f.__proto__ = p;
    assert(!f.hasOwnProperty("caller"));
    f.caller = 42;
    assert(f.caller === 42);
    assert(!f.hasOwnProperty("arguments"));
    f.arguments = 44;
    assert(f.arguments === 44);
}

{
    let proxy = new Proxy({}, {
        has(...args) {
            throw new Error("Should not be called!");
        }
    });
    for (let i = 0; i < 1000; ++i) {
        test2(function () {}.bind(), proxy);
        test2(function () { "use strict"; }, proxy);
        test2(new Function(`"use strict";`), proxy);
        test2(new GeneratorFunction, proxy);
        test2(class C { }, proxy);
        test2(() => undefined, proxy);
        test2(async function foo(){}, proxy);
        test2(function* foo() { }, proxy);
    }
}

for (let i = 0; i < 1000; ++i) {
    test2(function() {}.bind());
    test2(function () { "use strict"; });
    test2(new Function(`"use strict";`));
    test2(new GeneratorFunction);
    test2(class C { });
    test2(() => undefined);
    test2(async function foo(){});
    test2(function* foo() { });
}

function test3(f) {
    f.__proto__ = {};

    assert(!f.hasOwnProperty("caller"));
    f.caller = 42;
    assert(f.caller === 42);
    assert(f.hasOwnProperty("caller"));
    assert(delete f.caller === true);
    assert(f.caller === undefined);
    assert(!f.hasOwnProperty("caller"));

    assert(!f.hasOwnProperty("arguments"));
    f.arguments = 44;
    assert(f.arguments === 44);
    assert(f.hasOwnProperty("arguments"));
    assert(delete f.arguments === true);
    assert(f.arguments === undefined);
    assert(!f.hasOwnProperty("arguments"));
}
for (let i = 0; i < 1000; ++i) {
    test3(function () {}.bind());
    test3(function () { "use strict"; });
    test3(new Function(`"use strict";`));
    test3(new GeneratorFunction);
    test3(class C { });
    test3(() => undefined);
    test3(async function foo(){});
    test3(function* foo() { });
}

for (let i = 0; i < 1000; ++i) {
    class C1 { static caller() {} }
    C1.caller = 1;
    assert(C1.caller === 1);

    class C2 { static arguments() {} }
    C2.arguments = 2;
    assert(C2.arguments === 2);
}

test1(String.prototype.italics);
test2(Reflect.deleteProperty);
test3(Math.log1p);
