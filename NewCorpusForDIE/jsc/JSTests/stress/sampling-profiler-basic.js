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

    function bar(y) {
        let x;
        for (let i = 0; i < 20; i++)
            x = new Error();
        return x;
    }
    noInline(bar);

    function foo() {
        bar(1000);
    }
    noInline(foo);

    function nothing(x) { return x; }
    noInline(nothing);

    runTest(foo, ["Error", "bar", "foo"]);

    function top() { 
        let x = 0;
        for (let i = 0; i < 25; i++) {
            x++;
            x--;
        }
    }

    function jaz(x) { return x + top(); }
    function kaz(y) {
        return jaz(y) + 5;
    }
    function checkInlining() {
        for (let i = 0; i < 100; i++)
            kaz(104);
    }

    // Tier it up.
    for (let i = 0; i < 1000; i++)
        checkInlining();

    runTest(checkInlining, ["jaz", "kaz", "checkInlining"]);
}
