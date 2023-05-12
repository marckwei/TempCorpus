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

//@ skip if not $jitTests
//@ slow!
//@ noEagerNoNoLLIntTestsRunLayoutTest

description("Regression test for https://webkit.org/b/139548. This test should not crash.");

var maxArgCount = 8;
var argIncrement = 1;

function ToStringObj()
{
    s: ""
}

// Want a function that a native C++ function can call.
ToStringObj.prototype.toString = function() { this.s = new String(""); return this.s; };

var myObj = new ToStringObj();

function makeArgsArray(firstArg, argCount)
{
    var args = [firstArg];
    for (var argIndex = 1; argIndex < argCount; argIndex++)
        args.push(argIndex);

    return args;
}

function recurseNoDFG(depth)
{
    var s = "";
    if (depth <= 0)
        return 0;

    for (var i = 1; i < maxArgCount; i += argIncrement) {
        try {
            s = myObj.toLocaleString();
            return recurseNoDFG.apply(this, makeArgsArray(depth - 1, i));
        } catch (e) {
            if (e instanceof String)
                throw e;

            for (var j = 1; j < maxArgCount; j += argIncrement) {
                try {
                    s = myObj.toLocaleString();
                    recurseNoDFG.apply(this, makeArgsArray(depth - 1, j)) + 1;
                } catch (e1) {
                }
            }

            throw "Got an exception";
        }
    }
    return s.length;
}

function recurse(depth)
{
    var s = "";

    if (depth <= 0)
        return 0;

    for (var i = 1; i < maxArgCount; i += argIncrement) {
        s = myObj.toLocaleString();
        return recurse.apply(this, makeArgsArray(depth - 1, i));
    }

    return s.length;
}

function probeAndRecurse(depth)
{
    var result;

    // Probe stack depth
    try {
        result = probeAndRecurse(depth);
        if (result == 0)
            depth = 50;
        else if (result < 0)
            return result + 1;
        else
            return result;
    } catch (e) {
        // Go up a several frames and then call recursive functions that consume
        // variable stack amounts in an effort to exercise various stack checks.
        return -6;
    }

    for (var i = 1; i < maxArgCount; i += argIncrement) {
        try {
            recurseNoDFG.apply(this, makeArgsArray(depth, i));
        } catch (e) {
        }
    }

    for (var i = 1; i < maxArgCount; i += argIncrement) {
        try {
            recurse.apply(this, makeArgsArray(depth, i));
        } catch (e) {
        }
    }

    return 1;
}

// Warm up recurse functions
for (var loopCount = 0; loopCount < 5000; loopCount++)
    recurse(10);

probeAndRecurse(0);
