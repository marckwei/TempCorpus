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

// Regression test for 160749.  This test should not exit with an error or crash.
// Check that the Baseline JIT GetByValWithCacheId and PutByValWithCahcedId stubs properly handle exceptions.

function testCachedGetByVal()
{
    o = { };
    o['a'] = 42;

    let result = 0;
    let loopCount = 100000;
    let interationToChange = 90000;
    let expectedResult = 42 * interationToChange;
    let exceptions = 0;
    let expectedExceptions = loopCount - interationToChange;

    for (let i = 0; i < loopCount; i++) {
        if (i == interationToChange) {
            Object.defineProperty(o, "a", {
                enumerable: true,
                get: function() { throw "error"; return 100; }
            });
        }

        for (let v in o) {
            try {
                result += o[v.toString()];
            } catch(e) {
                if (e == "error")
                    exceptions++;
                else
                    throw "Got wrong exception \"" + e + "\"";
            }
        }
    }

    if (result != expectedResult)
        throw "Expected a result of " + expectedResult + ", but got " + result;
    if (exceptions != expectedExceptions)
        throw "1 Expected " + expectedExceptions + " exceptions, but got " + exceptions;
}

noDFG(testCachedGetByVal);

function testCachedPutByVal()
{
    o = { };
    o['a'] = 0;

    let result = 0;
    let loopCount = 100000;
    let iterationToChange = 90000;
    let exceptions = 0;
    let expectedExceptions = loopCount - iterationToChange;

    for (let i = 0; i < loopCount; i++) {
        if (i == iterationToChange) {
            result = o.a;
            Object.defineProperty(o, "_a", {
                enumerable: false,
                value: -1
            });
            Object.defineProperty(o, "a", {
                enumerable: true,
                set: function(v) { throw "error"; o._a = v; }
            });
        }

        for (let v in o) {
            try {
                o[v.toString()] = i + 1;
            } catch(e) {
                if (e == "error")
                    exceptions++;
                else
                    throw "Got wrong exception \"" + e + "\"";
            }
        }
    }

    if (result != iterationToChange)
        throw "Expected a result of " + result + ", but got " + o.a;
    if (o._a != -1)
        throw "Expected o._b to -1, but it is " + o._a;
    if (exceptions != expectedExceptions)
        throw "Expected " + expectedExceptions + " exceptions, but got " + exceptions;
}

noDFG(testCachedPutByVal);

testCachedGetByVal();
testCachedPutByVal();
