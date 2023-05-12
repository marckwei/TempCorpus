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

(function nonInlinedTailCall() {
    function callee() { if (callee.caller != nonInlinedTailCall) throw new Error(); }
    noInline(callee);

    function caller() { "use strict"; return callee(); }

    for (var i = 0; i < 10000; ++i)
        caller();

    function loop(n) { "use strict"; if (n > 0) return loop(n - 1); }
    noInline(loop);

    loop(1000000);
})();

(function inlinedTailCall() {
    function callee() { if (callee.caller != inlinedTailCall) throw new Error(); }
    function caller() { "use strict"; return callee(); }

    for (var i = 0; i < 10000; ++i)
        caller();

    function loop(n) { "use strict"; if (n > 0) return loop(n - 1); }

    loop(1000000);
})();

(function nonInlinedEmulatedTailCall() {
    function emulator() { caller(); }
    function callee() { if (callee.caller != emulator) throw new Error(); }
    noInline(callee);
    function caller() { "use strict"; return callee(); }

    for (var i = 0; i < 10000; ++i)
        emulator();

    function pad(n) { "use strict"; return loop(n); }
    function loop(n) { "use strict"; if (n > 0) return pad(n - 1); }
    noInline(loop);

    loop(1000000);
})();

(function inlinedEmulatedTailCall() {
    function emulator() { caller(); }
    function callee() { if (callee.caller != emulator) throw new Error(); }
    function caller() { "use strict"; return callee(); }

    for (var i = 0; i < 10000; ++i)
        emulator();

    function pad(n) { "use strict"; return loop(n); }
    function loop(n) { "use strict"; if (n > 0) return pad(n - 1); }

    loop(1000000);
})();
