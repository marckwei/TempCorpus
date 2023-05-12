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

let assert = {
    sameValue: function (lhs, rhs) {
        if (lhs !== rhs)
            throw new Error("Expected: " + lhs + " bug got: " + rhs);
    },

    throws: function (expectedError, op) {
        try {
          op();
        } catch(e) {
            if (!(e instanceof expectedError))
                throw new Error("Expected to throw: " + expectedError + " but threw: " + e);
        }
    }
};

(function () {
    let createAndInstantiateClass = function () {
        class C {
            get #m() { return 'test'; }

            access(o) {
                return o.#m;
            }
        }

        return new C();
    }

    let c1 = createAndInstantiateClass();
    let c2 = createAndInstantiateClass();

    assert.sameValue(c1.access(c1), 'test');
    assert.sameValue(c2.access(c2), 'test');

    assert.throws(TypeError, function() {
        c1.access(c2);
    });

    assert.throws(TypeError, function() {
        c2.access(c1);
    });
})();

(function () {
    class S {
        get #m() { return 'super class'; }

        superAccess() { return this.#m; }
    }

    class C extends S {
        get #m() { return 'subclass'; }

        access() {
            return this.#m;
        }
    }

    let c = new C();

    assert.sameValue(c.access(), 'subclass');
    assert.sameValue(c.superAccess(), 'super class');

    let s = new S();
    assert.sameValue(s.superAccess(), 'super class');
    assert.throws(TypeError, function() {
        c.access.call(s);
    });
})();

(function () {
    class C {
        get #m() { return 'test'; }

        access(o) {
            return o.#m;
        }
    }

    let c = new C();
    assert.sameValue(c.access(c), 'test');

    let o = {};
    assert.throws(TypeError, function() {
        c.access(o);
    });
})();

