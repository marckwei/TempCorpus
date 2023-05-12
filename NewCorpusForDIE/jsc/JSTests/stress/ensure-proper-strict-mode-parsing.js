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


function foo() {
    "hello world i'm not use strict.";
    function bar() {
        return 25;
    }
    bar();
    "use strict";
    return this;
}
if (foo.call(undefined) !== this)
    throw new Error("Bad parsing strict mode.");

function bar() {
    "hello world i'm not use strict.";
    function foo() {
        return this;
    }
    "use strict";
    return foo.call(undefined);
}
if (bar.call(undefined) !== this)
    throw new Error("Bad parsing strict mode.")

function baz() {
    "foo";
    "bar";
    "baz";
    "foo";
    "bar";
    "baz";
    "foo";
    "bar";
    "baz";
    "use strict";
    return this;
}
if (baz.call(undefined) !== undefined)
    throw new Error("Bad parsing strict mode.")

function jaz() {
    "foo";
    `bar`;
    "use strict";
    return this;
}
if (jaz.call(undefined) !== this)
    throw new Error("Bad parsing strict mode.")

function vaz() {
    "foo";
    "use strict";
    `bar`;
    return this;
}
if (vaz.call(undefined) !== undefined)
    throw new Error("Bad parsing strict mode.")

function hello() {
    "foo";
    2 + 2
    "use strict";
    return this;
}
if (hello.call(undefined) !== this)
    throw new Error("Bad parsing strict mode.")

function world() {
    "foo";
    let x;
    "use strict";
    return this;
}
if (world.call(undefined) !== this)
    throw new Error("Bad parsing strict mode.")

function a() {
    "foo";
    world;
    "use strict";
    return this;
}
if (a.call(undefined) !== this)
    throw new Error("Bad parsing strict mode.")

if (eval("'foo'; 'use strict'; 'bar';") !== "bar")
    throw new Error("Bad parsing strict mode.");

if (eval("'foo'; 'use strict'; 'bar'; this;") !== this)
    throw new Error("Bad parsing strict mode.");
