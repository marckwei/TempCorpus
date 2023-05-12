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
    class C {
        set #m(v) { this._v = v; }

        B = class {
            method(o, v) {
                o.#m = v;
            }
        }
    }

    let c = new C();
    let innerB = new c.B();
    innerB.method(c, 'test');
    assert.sameValue(c._v, 'test');
})();

(function () {
    class C {
        set #m(v) { this._v = v; }

        method(v) { this.#m = v; }

        B = class {
            method(o, v) {
                o.#m = v;
            }

            get m() { return this.#m; }

            #m;
        }
    }

    let c = new C();
    let innerB = new c.B();

    innerB.method(innerB, 'test');
    assert.sameValue(innerB.m, 'test');

    c.method('outer class');
    assert.sameValue(c._v, 'outer class');

    assert.throws(TypeError, function() {
        innerB.method(c, 'foo');
    });
})();

(function () {
    class C {
        set #m(v) { this._v = v; }

        method(v) { this.#m = v; }

        B = class {
            method(o, v) {
                o.#m = v;
            }

            get #m() { return 'test'; }
        }
    }

    let c = new C();
    let innerB = new c.B();

    assert.throws(TypeError, function() {
        innerB.method(innerB);
    });

    c.method('outer class');
    assert.sameValue(c._v, 'outer class');

    assert.throws(TypeError, function() {
        innerB.method(c);
    });
})();

(function () {
    class C {
        set #m(v) { this._v = v; }

        method(v) { this.#m = v; }

        B = class {
            method(o, v) {
                o.#m = v;
            }

            #m() { return 'test'; }
        }
    }

    let c = new C();
    let innerB = new c.B();

    assert.throws(TypeError, function() {
        innerB.method(innerB, 'foo');
    });

    c.method('outer class');
    assert.sameValue(c._v, 'outer class');

    assert.throws(TypeError, function() {
        innerB.method(c);
    });
})();

(function () {
    class C {
        set #m(v) { this._v = v; }

        method(v) { this.#m = v; }

        B = class {
            method(o, v) {
                o.#m = v;
            }

            set #m(v) { this._v = v; }
        }
    }

    let c = new C();
    let innerB = new c.B();

    innerB.method(innerB, 'test262');
    assert.sameValue(innerB._v, 'test262');

    c.method('outer class');
    assert.sameValue(c._v, 'outer class');

    assert.throws(TypeError, function() {
        innerB.method(c, 'foo');
    });
})();

