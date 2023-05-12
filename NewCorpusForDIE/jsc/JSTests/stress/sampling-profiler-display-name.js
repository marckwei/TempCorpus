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

if (platformSupportsSamplingProfiler()) {
    load("./sampling-profiler/samplingProfiler.js", "caller relative");

    function foo() {
        let o = {};
        for (let i = 0; i < 500; i++)
            o[i + "p"] = i;
    }
    foo.displayName = "display foo";
    runTest(foo, ["display foo"]);


    function baz() {
        let o = {};
        for (let i = 0; i < 500; i++)
            o[i + "p"] = i;
    }
    Object.defineProperty(baz, 'displayName', { get: function() { throw new Error("shouldnt be called"); } }); // We should ignore this because it's a getter.
    runTest(baz, ["baz"]);


    function bar() {
        let o = {};
        for (let i = 0; i < 500; i++)
            o[i + "p"] = i;
    }
    bar.displayName = 20; // We should ignore this because it's not a string.
    runTest(bar, ["bar"]);

    function jaz() {
        let o = {};
        for (let i = 0; i < 500; i++)
            o[i + "p"] = i;
    }
    jaz.displayName = ""; // We should ignore this because it's the empty string.
    runTest(jaz, ["jaz"]);

    function makeFunction(displayName) {
        let result = function() {
            let o = {};
            for (let i = 0; i < 500; i++)
                o[i + "p"] = i;
        };
        result.displayName = displayName;
        return result;
    }

    runTest(makeFunction("hello world"), ["hello world"])
}
