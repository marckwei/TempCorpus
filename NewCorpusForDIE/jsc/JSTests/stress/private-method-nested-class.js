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

function assert(a, e) {
    if (a !== e)
        throw new Error("Expected: " + e + " but got: " + a);
}

(() => {
    class Base {
        C = class {
            method() {
                return this.#mBase();
            }
        }

        #mBase() {
            return 4;
        }
    }

    let base = new Base();
    let c = new base.C();
    assert(c.method.call(base), 4);

    try {
        c.method();
    } catch (e) {
        assert(e instanceof TypeError, true);
    }
})();

// Test shadow methods

(() => {
    class Base {
        method() {
            return this.#m();
        }

        C = class {
            method(o) {
                return o.#m();
            }

            #m() {
                return this.foo;
            }

            foo = 4;
        };

        #m() {
            return "foo";
        }
    }

    let base = new Base();
    let c = new base.C();
    assert(c.method(c), 4);
    assert(base.method(), "foo");

    try {
        c.method(base);
    } catch (e) {
        assert(e instanceof TypeError, true);
    }
})();

