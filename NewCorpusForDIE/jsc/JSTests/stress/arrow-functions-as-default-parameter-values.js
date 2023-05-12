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
        throw new Error("Bad assertion")
}
function test(f, n = 1000) {
    for (let i = 0; i < n; i++)
        f();
}

test(function() {
    function foo(x = ()=>this) {
        return x();
    }
    let o = {};
    assert(foo.call(o) === o);
})

test(function() {
    function foo(x = ()=>arguments) {
        assert(x() === arguments);
    }
    foo();
})

test(function() {
    function foo({x = ()=>arguments}) {
        assert(x() === arguments);
    }
    foo({x:undefined});
})

test(function() {
    function foo(x = ()=>arguments) {
        let a = x();
        assert(a.length === 3);
        assert(a[0] === undefined);
        assert(a[1] === 20);
        assert(a[2] === 40);
    }
    foo(undefined, 20, 40);
})

test(function() {
    function foo(x = ()=>new.target) {
        assert(x() === foo);
    }
    new foo(undefined);
})

test(function() {
    function foo({x = ()=>new.target}) {
        assert(x() === foo);
    }
    new foo({});
})

test(function() {
    function foo(x = ()=>arguments) {
        var arguments;
        assert(x() === arguments);
    }
    foo(undefined);
});

test(function() {
    function foo(x = ()=>arguments) {
        var arguments = 25;
        assert(x() === arguments);
    }
    foo(undefined);
});

test(function() {
    function foo(x = (y = ()=>arguments)=>y()) {
        assert(x() === arguments);
    }
    foo(undefined);
});

test(function() {
    function foo({x = (y = ()=>arguments)=>y()}) {
        assert(x() === arguments);
    }
    foo({});
});

test(function() {
    function foo(x = (y = ()=>this)=>y()) {
        return x();
    }
    let o = {};
    foo.call(o);
});

test(function() {
    function foo(x = (y = ()=>new.target)=>y()) {
        assert(x() === foo);
    }
    new foo();
});

test(function() {
    function foo(x = (y = ()=>new.target)=>y()) {
        assert(x() === undefined);
    }
    foo();
});

test(function() {
    class C {
        constructor() { this._x = 45; }
        get foo() { return this._x;}
    }
    class D extends C {
        constructor(x = () => super.foo) {
            super();
            assert(x() === 45);
        }
        x(x = ()=>super.foo) {
            return x();
        }
    }
    assert((new D).x() === 45);
});

test(function() {
    class C {
        constructor() { this._x = 45; }
        get foo() { return this._x;}
    }
    class D extends C {
        x(x = () => {return super.foo}) {
            return x();
        }
    }
    assert((new D).x() === 45);
});

test(function() {
    class C {
        constructor() { this._x = 45; }
        get foo() { return this._x;}
    }
    class D extends C {
        x(x = () => {return () => super.foo}) {
            return x()();
        }
    }
    assert((new D).x() === 45);
});

test(function() {
    class C {
        constructor() { this._x = 45; }
        get foo() { return this._x;}
    }

    class D extends C {
        x(y = (y = () => super.foo) => {return y()}) {
            return y();
        }
    }
    assert((new D).x() === 45);
});

test(function() {
    class C {
        constructor() { this._x = 45; }
        get foo() { return this._x;}
    }

    class D extends C {
        constructor(x = () => super.foo) {
            super();
            this._x_f = x;
        }

        x() {
            return this._x_f(); 
        }
    }
    assert((new D).x() === 45);
});

test(function() {
    class C {
        constructor() { this._x = 45; }
        get foo() { return this._x;}
    }

    class D extends C {

        constructor(x = () => super()) {
            x();
        }

        x() {
            return super.foo;
        }
    }
    assert((new D).x() === 45);
});

