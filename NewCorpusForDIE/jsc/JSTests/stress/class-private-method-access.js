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

function assertThrows(expectedError, f) {
    try {
        f();
    } catch (e) {
        assert(e instanceof expectedError, true);
    }
}

(() => {
    class C {
        static get #m() {
            return 'static';
        }

        static staticAccess() {
            return this.#m;
        }

        get #f() {
            return 'instance';
        }

        instanceAccess() {
            return this.#f;
        }
    }

    let c = new C();
    assert(C.staticAccess(), 'static');
    assert(c.instanceAccess(), 'instance');

    assertThrows(TypeError, () => {
        C.staticAccess.call(c);
    });

    assertThrows(TypeError, () => {
        c.instanceAccess.call(C);
    });
})();

(() => {
    class C {
        static #m() {
            return 'static';
        }

        static staticAccess() {
            return this.#m();
        }

        #f() {
            return 'instance';
        }

        instanceAccess() {
            return this.#f();
        }
    }

    let c = new C();
    assert(C.staticAccess(), 'static');
    assert(c.instanceAccess(), 'instance');

    assertThrows(TypeError, () => {
        C.staticAccess.call(c);
    });

    assertThrows(TypeError, () => {
        c.instanceAccess.call(C);
    });
})();

(() => {
    class C {
        static set #m(v) {
            this._m = v;
        }

        static staticAccess() {
            this.#m = 'static';
        }

        set #f(v) {
            this._f = v;
        }

        instanceAccess() {
            this.#f = 'instance';
        }
    }

    let c = new C();
    C.staticAccess();
    assert(C._m, 'static');
    c.instanceAccess()
    assert(c._f, 'instance');

    assertThrows(TypeError, () => {
        C.staticAccess.call(c);
    });

    assertThrows(TypeError, () => {
        c.instanceAccess.call(C);
    });
})();

