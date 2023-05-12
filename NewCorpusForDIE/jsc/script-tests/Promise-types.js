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

description("Promises - Test basic types / exceptions.");

// Promise
debug("");
debug("Promises");
debug("");

// Silence unhandled rejection messages.
onunhandledrejection = () => false;

// Promises should be of type Promise.

var aPromise = new Promise(function(resolve, reject) { resolve(1); });

debug("aPromise = new Promise(...)")
shouldBeType("aPromise", "Promise");
shouldBe("String(aPromise)", "'[object Promise]'");

shouldBeDefined("aPromise.then");
shouldBeType("aPromise.then", "Function");
shouldBe("aPromise.then.length", "2");
shouldBeDefined("aPromise.catch");
shouldBeType("aPromise.catch", "Function");
shouldBe("aPromise.catch.length", "1");
shouldBeType("aPromise.finally", "Function");
shouldBe("aPromise.finally.length", "1");


debug("aPromise2 = Promise(...)")
shouldThrow(`Promise(function(resolve, reject) { resolve(1); })`);

// Promise constructor
debug("");
debug("Promise constructor");
debug("");

// Need at least one parameter.
shouldBe("Promise.length", "1");
shouldThrow("new Promise()");
shouldThrow("Promise()");

// Parameter must be a function.
shouldThrow("new Promise(1)", "'TypeError: Promise constructor takes a function argument'");
shouldThrow("new Promise('hello')", "'TypeError: Promise constructor takes a function argument'");
shouldThrow("new Promise([])", "'TypeError: Promise constructor takes a function argument'");
shouldThrow("new Promise({})", "'TypeError: Promise constructor takes a function argument'");
shouldThrow("new Promise(null)", "'TypeError: Promise constructor takes a function argument'");
shouldThrow("new Promise(undefined)", "'TypeError: Promise constructor takes a function argument'");

shouldThrow("Promise(1)", "'TypeError: Cannot call a constructor without |new|'");
shouldThrow("Promise('hello')", "'TypeError: Cannot call a constructor without |new|'");
shouldThrow("Promise([])", "'TypeError: Cannot call a constructor without |new|'");
shouldThrow("Promise({})", "'TypeError: Cannot call a constructor without |new|'");
shouldThrow("Promise(null)", "'TypeError: Cannot call a constructor without |new|'");
shouldThrow("Promise(undefined)", "'TypeError: Cannot call a constructor without |new|'");

// Promise statics
debug("");
debug("Promise statics");
debug("");


// Need at least one parameter.
shouldBeType("Promise.resolve", "Function");
shouldBe("Promise.resolve.length", "1");
shouldNotThrow("Promise.resolve(1)");

shouldBeType("Promise.reject", "Function");
shouldBe("Promise.reject.length", "1");
shouldNotThrow("Promise.reject(1)");

// Should return Promise objects.
shouldBeType("Promise.resolve(1)", "Promise");
shouldBeType("Promise.reject(1)", "Promise");


