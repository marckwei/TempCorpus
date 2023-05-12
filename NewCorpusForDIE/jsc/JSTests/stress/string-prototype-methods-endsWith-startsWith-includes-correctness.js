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
        throw new Error("Bad assertion!");
}

function test(f) {
    for (let i = 0; i < 500; i++)
        f();
}

test(function() {
    let foo = "hello";
    let threw = false;
    try {
        foo.endsWith(/foo/);
    } catch(e) {
        assert(e.toString() === "TypeError: Argument to String.prototype.endsWith cannot be a RegExp");
        threw = true;
    }
    assert(threw);
});

test(function() {
    let foo = "hello";
    let threw = false;
    try {
        foo.startsWith(/foo/);
    } catch(e) {
        assert(e.toString() === "TypeError: Argument to String.prototype.startsWith cannot be a RegExp");
        threw = true;
    }
    assert(threw);
});

test(function() {
    let foo = "hello";
    let threw = false;
    try {
        foo.includes(/foo/);
    } catch(e) {
        assert(e.toString() === "TypeError: Argument to String.prototype.includes cannot be a RegExp");
        threw = true;
    }
    assert(threw);
});

test(function() {
    let props = [];
    let proxy = new Proxy(/foo/, {
        get(theTarget, prop) {
            props.push(prop);
            return theTarget[prop];
        }
    });

    let foo = "hello";
    let threw = false;
    try {
        foo.endsWith(proxy);
    } catch(e) {
        assert(e.toString() === "TypeError: Argument to String.prototype.endsWith cannot be a RegExp");
        threw = true;
    }
    assert(threw);
    assert(props.length === 1);
    assert(props[0] === Symbol.match);
});

test(function() {
    let props = [];
    let proxy = new Proxy(/foo/, {
        get(theTarget, prop) {
            props.push(prop);
            return theTarget[prop];
        }
    });

    let foo = "hello";
    let threw = false;
    try {
        foo.startsWith(proxy);
    } catch(e) {
        assert(e.toString() === "TypeError: Argument to String.prototype.startsWith cannot be a RegExp");
        threw = true;
    }
    assert(threw);
    assert(props.length === 1);
    assert(props[0] === Symbol.match);
});

test(function() {
    let props = [];
    let proxy = new Proxy(/foo/, {
        get(theTarget, prop) {
            props.push(prop);
            return theTarget[prop];
        }
    });

    let foo = "hello";
    let threw = false;
    try {
        foo.includes(proxy);
    } catch(e) {
        assert(e.toString() === "TypeError: Argument to String.prototype.includes cannot be a RegExp");
        threw = true;
    }
    assert(threw);
    assert(props.length === 1);
    assert(props[0] === Symbol.match);
});

test(function() {
    let props = [];
    let proxy = new Proxy(/foo/, {
        get(theTarget, prop) {
            props.push(prop);
            if (prop === Symbol.match)
                return undefined;
            return theTarget[prop];
        }
    });

    let foo = "/foo/";
    let threw = false;
    let result = foo.includes(proxy);
    assert(result);
    assert(props.length === 5);
    assert(props[0] === Symbol.match);
    assert(props[1] === Symbol.toPrimitive);
    assert(props[2] === "toString");
    assert(props[3] === "source");
    assert(props[4] === "flags");
});

test(function() {
    let props = [];
    let proxy = new Proxy(/foo/, {
        get(theTarget, prop) {
            props.push(prop);
            if (prop === Symbol.match)
                return undefined;
            return theTarget[prop];
        }
    });

    let foo = "/foo/";
    let threw = false;
    let result = foo.startsWith(proxy);
    assert(result);
    assert(props.length === 5);
    assert(props[0] === Symbol.match);
    assert(props[1] === Symbol.toPrimitive);
    assert(props[2] === "toString");
    assert(props[3] === "source");
    assert(props[4] === "flags");
});

test(function() {
    let props = [];
    let proxy = new Proxy(/foo/, {
        get(theTarget, prop) {
            props.push(prop);
            if (prop === Symbol.match)
                return undefined;
            return theTarget[prop];
        }
    });

    let foo = "/foo/";
    let threw = false;
    let result = foo.endsWith(proxy);
    assert(result);
    assert(props.length === 5);
    assert(props[0] === Symbol.match);
    assert(props[1] === Symbol.toPrimitive);
    assert(props[2] === "toString");
    assert(props[3] === "source");
    assert(props[4] === "flags");
});
