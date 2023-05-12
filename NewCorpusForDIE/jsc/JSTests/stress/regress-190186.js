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

//@ runDefault("--useConcurrentJIT=false", "--sweepSynchronously=true")

// This test passes if it does not crash with an ASAN build.

(function() {
    var bar = {};

    for (var i = 0; i < 68; ++i)
        String.raw`boo`;

    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);

    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);

    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);

    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);

    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);

    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);

    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);
    eval(String.raw`bar += 0;`);

    eval(String.raw`foo = class { };`);
    foo += 0;

    gc();
    try {
        eval(foo.toString());
    } catch (e) {
        exception = e;
    }

    if (exception != "SyntaxError: Class statements must have a name.")
        throw "FAIL";
})();
