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
        for (let i = 0; i < 100; i++) {
            o[i + "p"] = i;
        }
    }

    function bar() {
        let o = {};
        for (let i = 0; i < 100; i++) {
            o[i + "p"] = i;
        }
    }

    let boundFoo = foo.bind(null);
    let boundBar = bar.bind(null);

    let baz = function() {
        boundFoo();
        boundBar();
    }

    // It depends on JIT enablement. But this is OK since this is sampling-profiler's internal data.
    if ($vm.useDFGJIT()) {
        runTest(baz, ["foo", "baz"]);
        runTest(baz, ["bar", "baz"]);
    } else {
        runTest(baz, ["foo", "bound foo", "baz"]);
        runTest(baz, ["bar", "bound bar", "baz"]);
    }
}
