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
        throw new Error("Bad assertion");
}

function test(f) {
    for (let i = 0; i < 500; i++)
        f();
}

test(function() {
    let proxy = new Proxy([], {});
    assert(JSON.stringify(proxy) === "[]");
});

test(function() {
    let target = ["foo"];
    let proxy = new Proxy(target, {});
    assert(JSON.stringify(proxy) === JSON.stringify(target));
});

test(function() {
    let target = {
        foo: 25,
        bar: false,
        0: 45
    };
    let proxy = new Proxy(target, {});
    assert(JSON.stringify(proxy) === JSON.stringify(target));
});

test(function() {
    let target = {
        foo: ["baz", {foo: 45}],
        bar: false,
        0: 45,
        baz: "hello world",
        jaz: 4553.434
    };
    let proxy = new Proxy(target, {});
    assert(JSON.stringify(proxy) === JSON.stringify(target));
});

test(function() {
    let target = {
        foo: ["baz", {foo: 45}],
        bar: false,
        0: 45,
        baz: "hello world",
        jaz: 4553.434
    };
    let proxy = new Proxy(target, {});
    for (let i = 0; i < 50; i++)
        proxy = new Proxy(proxy, {});
    assert(JSON.stringify(proxy) === JSON.stringify(target));
});

test(function() {
    let target = [20, 30, "foo", {hello: "world"}];
    let proxy = new Proxy(target, {});
    for (let i = 0; i < 50; i++)
        proxy = new Proxy(proxy, {});
    assert(JSON.stringify(proxy) === JSON.stringify(target));
});

test(function() {
    let target = {
        foo: ["baz", {foo: 45}],
        bar: false,
        0: 45,
        baz: "hello world",
        jaz: 4553.434
    };
    let {proxy, revoke} = Proxy.revocable(target, {});
    assert(JSON.stringify(proxy) === JSON.stringify(target));

    revoke();
    JSON.stringify(target); // Things are ok.
    let threw = false;
    try {
        JSON.stringify(proxy); // Things are not ok.
    } catch(e) {
        threw = true;
        assert(e.toString() === "TypeError: Proxy has already been revoked. No more operations are allowed to be performed on it");
    }
    assert(threw);
});

test(function() {
    let target = ["foo", "bar", 25, false];
    let proxy = new Proxy(target, {});
    let revoke;
    for (let i = 0; i < 50; i++) {
        if (i === 25) {
            let result = Proxy.revocable(proxy, {});
            proxy = result.proxy;
            revoke = result.revoke;
        } else {
            proxy = new Proxy(proxy, {});
        }
    }
    assert(JSON.stringify(proxy) === JSON.stringify(target));

    revoke();
    JSON.stringify(target); // Things are ok.
    let threw = false;
    try {
        JSON.stringify(proxy); // Things are not ok.
    } catch(e) {
        threw = true;
        assert(e.toString() === "TypeError: Proxy has already been revoked. No more operations are allowed to be performed on it");
    }
    assert(threw);
});

test(function() {
    let arr = ["foo", 25, "bar"];
    let handler = {
        get: function(theTarget, propName) {
            assert(propName === "toJSON");
            return function() {
                return arr;
            }
        }
    };
    let proxy = new Proxy({}, handler);
    assert(JSON.stringify(proxy) === JSON.stringify(arr));
});

test(function() {
    let arr = ["foo", 25, "bar"];
    let handler = {
        get: function(theTarget, propName) {
            assert(propName === "toJSON");
            return function() {
                return arr;
            }
        }
    };
    let proxy = new Proxy({}, handler);
    let o1 = {foo: arr};
    let o2 = {foo: proxy};
    assert(JSON.stringify(o1) === JSON.stringify(o2));
});

test(function() {
    let arr = ["foo", 25, "bar"];
    let proxy = new Proxy(function() { return arr; }, {});
    assert(JSON.stringify({toJSON: proxy}) === JSON.stringify(arr));
});

test(function() {
    let arr = ["foo", 25, "bar"];
    let proxy = new Proxy({}, {});
    let o = {foo: 20};
    Object.defineProperty(o, "toJSON", {
        enumerable: false,
        value: proxy
    });
    assert(JSON.stringify(o) === JSON.stringify({foo: 20}));
});
