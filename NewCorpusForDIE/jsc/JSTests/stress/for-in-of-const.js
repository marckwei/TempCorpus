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

// Check that const variables can't be assigned to from for-in/for-of.
// https://bugs.webkit.org/show_bug.cgi?id=156673

expect_nothrow = function(why, f) {
    f();
}

expect_throw = function(why, f) {
    threw = false;
    try {
        f();
    } catch (e) {
    if (e.toString() != "TypeError: Attempted to assign to readonly property.")
        throw Error("expected a TypeError, got " + e.toString());
        threw = true;
    }
    if (!threw)
        throw Error("expected to throw");
}

// for-in

expect_nothrow("regular for-in",              function() { for (x in [1,2,3]) x; });
expect_nothrow("var for-in",                  function() { for (var x in [1,2,3]) x; });
expect_nothrow("let for-in",                  function() { for (let x in [1,2,3]) x; });
expect_nothrow("for-in with const variable",  function() { for (const x in [1,2,3]) x; });
expect_nothrow("for-in which never iterates", function() { const x = 20; for (x in []) x; });

expect_throw("for-in on const from func's scope", function() { const x = 20; for (x in [1,2,3]) x; });
expect_throw("same, with intervening capture",    function() { const x = 20; capture = function() { x; }; for (x in [1,2,3]) x; });
expect_throw("same, iterating in capture",        function() { const x = 20; capture = function() { for (x in [1,2,3]) x; }; capture(); });

// for-of

expect_nothrow("regular for-of",              function() { for (x of [1,2,3]) x; });
expect_nothrow("var for-of",                  function() { for (var x of [1,2,3]) x; });
expect_nothrow("let for-of",                  function() { for (let x of [1,2,3]) x; });
expect_nothrow("for-of with const variable",  function() { for (const x of [1,2,3]) x; });
expect_nothrow("for-of which never iterates", function() { const x = 20; for (x of []) x; });

expect_throw("for-of on const from func's scope", function() { const x = 20; for (x of [1,2,3]) x; });
expect_throw("same, with intervening capture",    function() { const x = 20; capture = function() { x; }; for (x of [1,2,3]) x; });
expect_throw("same, iterating in capture",        function() { const x = 20; capture = function() { for (x of [1,2,3]) x; }; capture(); });

expect_throw("bad destructuring",          function() { let arr = [{x:20}]; const x = 50; for ({x} of arr) x; });
expect_nothrow("good destructuring",       function() { let arr = [{x:20}]; const x = 50; for ({x : foo} of arr) x; });
expect_nothrow("const good destructuring", function() { let arr = [{x:20}]; const x = 50; for (const {x} of arr) x; });
expect_nothrow("let good destructuring",   function() { let arr = [{x:20}]; const x = 50; for (let {x} of arr) x; });
// Note: `var {x}` would shadow `const x` and therefore fail.
