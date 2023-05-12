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

function assert(b) {
    if (!b)
        throw new Error("Bad assertion!")
}

function obj() { 
    return {};
}
noInline(obj);

// This test makes sure that when wrapper() is called with the closure created in foo() as |this|
// that we to_this the |this| that is a closure before the arrow function captures its value.
// This crashes if there is a bug in debug builds.

const globalThis = this;
function foo() {
    function capture() { return wrapper; }
    function wrapper() {
        let x = () => {
            Object.defineProperty(this, "baz", {
                get: function() { },
                set: function() { }
            });
            assert(!("bar" in this));
            assert(this === globalThis);
        }

        x();
    }
    wrapper();
}
foo();


function foo2() {
    function capture() { return wrapper; }
    function wrapper() {
        let x = () => {
            Object.defineProperty(this, "baz2", {
                get: function() { },
                set: function() { }
            });
            assert(this === globalThis);
        }

        x();

        function bar() {
            with (obj()) {
                assert;
            }
        }
        bar();
    }
    wrapper();
}
foo2();

assert(this.hasOwnProperty("baz"));
assert(this.hasOwnProperty("baz2"));
