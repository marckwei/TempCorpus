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
        get #m() { return 'test'; }

        B = class {
            method(o) {
                return o.#m;
            }
        }
    }

    let c = new C();
    let innerB = new c.B();
    assert.sameValue(innerB.method(c), 'test');
})();

(function () {
    class C {
        get #m() { return 'outer class'; }

        method() { return this.#m; }

        B = class {
            method(o) {
                return o.#m;
            }

            #m = 'test';
        }
    }

    let c = new C();
    let innerB = new c.B();
    assert.sameValue(innerB.method(innerB), 'test');
    assert.sameValue(c.method(), 'outer class');
    assert.throws(TypeError, function() {
        innerB.method(c);
    });
})();

(function () {
    class C {
        get #m() { return 'outer class'; }

        method() { return this.#m; }

        B = class {
            method(o) {
                return o.#m;
            }

            get #m() { return 'test'; }
        }
    }

    let c = new C();
    let innerB = new c.B();
    assert.sameValue(innerB.method(innerB), 'test');
    assert.sameValue(c.method(), 'outer class');
    assert.throws(TypeError, function() {
        innerB.method(c);
    });
})();

(function () {
    class C {
        get #m() { throw new Error('Should never execute'); }

        B = class {
            method(o) {
                return o.#m();
            }

            #m() { return 'test'; }
        }
    }

    let c = new C();
    let innerB = new c.B();
    assert.sameValue(innerB.method(innerB), 'test');
    assert.throws(TypeError, function() {
        innerB.method(c);
    });
})();

(function () {
    class C {
        get #m() { return 'outer class'; }

        method() { return this.#m; }

        B = class {
            method(o) {
                return o.#m;
            }

            set #m(v) { this._v = v; }
        }
    }

    let c = new C();
    let innerB = new c.B();

    assert.throws(TypeError, function() {
        innerB.method(innerB);
    });

    assert.sameValue(c.method(), 'outer class');

    assert.throws(TypeError, function() {
        C.prototype.method.call(innerB);
    });
})();

(function () {
    class C {
        #m() { return 'outer class'; }

        method() { return this.#m(); }

        B = class {
            method(o) {
                return o.#m;
            }

            get #m() { return 'test262'; }
        }
    }

    let c = new C();
    let innerB = new c.B();
    assert.sameValue(innerB.method(innerB), 'test262');
    assert.sameValue(c.method(), 'outer class');
    assert.throws(TypeError, function() {
        innerB.method(c);
    }, 'accessed inner class getter from an object of outer class');
    assert.throws(TypeError, function() {
        C.prototype.method.call(innerB);
    });
})();

