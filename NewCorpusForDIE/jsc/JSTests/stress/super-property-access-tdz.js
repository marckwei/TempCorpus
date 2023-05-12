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

function assert(b, m = "Bad!") {
    if (!b) {
        throw new Error(m);
    }
}

function test(f, iters = 1000) {
    for (let i = 0; i < iters; i++)
        f();
}

function shouldThrowTDZ(f) {
    let threw = false;
    try {
        f();
    } catch(e) {
        assert(e instanceof ReferenceError);
        assert(e.toString() === `ReferenceError: 'super()' must be called in derived constructor before accessing |this| or returning non-object.`);
        threw = true;
    }
    assert(threw);
}

test(function() {
    class A {
        get foo() {
            return this._x;
        }
        set foo(x) {
            this._x = x;
        }
    }

    function fooProp() { return 'foo'; }

    class B extends A {
        constructor() {
            super.foo = 20;
        }
    }

    class C extends A {
        constructor() {
            super[fooProp()] = 20;
        }
    }

    class D extends A {
        constructor() {
            super[fooProp()];
        }
    }

    class E extends A {
        constructor() {
            super.foo;
        }
    }

    class F extends A {
        constructor() {
            (() => super.foo = 20)();
        }
    }

    class G extends A {
        constructor() {
            (() => super[fooProp()] = 20)();
        }
    }

    class H extends A {
        constructor() {
            (() => super[fooProp()])();
        }
    }

    class I extends A {
        constructor() {
            (() => super.foo)();
        }
    }

    shouldThrowTDZ(function() { new B; });
    shouldThrowTDZ(function() { new C; });
    shouldThrowTDZ(function() { new D; });
    shouldThrowTDZ(function() { new E; });
    shouldThrowTDZ(function() { new F; });
    shouldThrowTDZ(function() { new G; });
    shouldThrowTDZ(function() { new H; });
    shouldThrowTDZ(function() { new I; });
});
