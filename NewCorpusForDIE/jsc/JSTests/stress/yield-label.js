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

// http://ecma-international.org/ecma-262/6.0/#sec-identifiers-static-semantics-early-errors
// If the "yield" label is used under the sloppy mode and the context is not
// a generator context, we can use "yield" as a label.

(function () {
    {
        yield: for (var i = 0; i < 1000; ++i) {
            break yield;
        }
    }
    {
        yield: for (var i = 0; i < 1000; ++i) {
            continue yield;
        }
    }
}());


function testSyntaxError(script, message) {
    var error = null;
    try {
        eval(script);
    } catch (e) {
        error = e;
    }
    if (!error)
        throw new Error("Expected syntax error not thrown");

    if (String(error) !== message)
        throw new Error("Bad error: " + String(error));
}

testSyntaxError(`
function test() {
    "use strict";
    {
        yield: for (var i = 0; i < 1000; ++i) {
            break yield;
        }
    }
}
`, `SyntaxError: Cannot use 'yield' as a label in strict mode.`);

testSyntaxError(`
function test() {
    "use strict";
    {
        label: for (var i = 0; i < 1000; ++i) {
            break yield;
        }
    }
}
`, `SyntaxError: Unexpected keyword 'yield'. Expected an identifier as the target for a break statement.`);

testSyntaxError(`
function test() {
    "use strict";
    {
        label: for (var i = 0; i < 1000; ++i) {
            continue yield;
        }
    }
}
`, `SyntaxError: Unexpected keyword 'yield'. Expected an identifier as the target for a continue statement.`)
