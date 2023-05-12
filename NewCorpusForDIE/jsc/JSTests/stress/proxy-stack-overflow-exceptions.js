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

function shouldThrowStackOverflow(f) {
    let threw = false;
    const verbose = false;
    try {
        f();
    } catch(e) {
        threw = e instanceof RangeError;
    }
    if (!threw)
        throw new Error("No stack overflow error thrown.");
    if (verbose)
        print("passed test: " + f + "\n\n");
}

const emptyFunction = function() { };
let seenStartObjects = new Map;
function makeLongProxyChain(startObject = emptyFunction) {
    if (seenStartObjects.has(startObject))
        return seenStartObjects.get(startObject);

    let p = new Proxy(startObject, { });
    for (let i = 0; i < 500000; i++)
        p = new Proxy(p, {});
    seenStartObjects.set(startObject, p);
    return p;
}

shouldThrowStackOverflow(function longProxyChain() {
    let f = makeLongProxyChain();
    f.name;
});

shouldThrowStackOverflow(function effecivelyCyclicProxyProtoChain1() {
    let t = {};
    let p = new Proxy(t, {}); 
    Object.setPrototypeOf(t, p); 
    t.propertyDoesNotExist;
});

shouldThrowStackOverflow(function effecivelyCyclicProxyProtoChain2() {
    let t = {};
    let p = new Proxy(t, {}); 
    Object.setPrototypeOf(t, p); 
    for (var k in p)
        break;
});

shouldThrowStackOverflow(function effecivelyCyclicProxyProtoChain3() {
    let t = {}; 
    let p = new Proxy(t, {});
    Object.setPrototypeOf(t, p);
    Object.prototype.toString.call(p);
});

shouldThrowStackOverflow(function longProxyChainBind() {
    let p = makeLongProxyChain();
    Function.prototype.bind.call(p)
});

shouldThrowStackOverflow(function longProxyChainPropertyAccess() {
    let p = makeLongProxyChain();
    p.nonExistentProperty;
});

shouldThrowStackOverflow(function longProxyChainReflectConstruct() {
    let p = makeLongProxyChain();
    Reflect.construct(Array, [], p);
});

shouldThrowStackOverflow(function longProxyChainReflectSet() {
    let p = makeLongProxyChain();
    Reflect.set([null], 0, 0, p);
});

shouldThrowStackOverflow(function longProxyChainReflectOwnKeys() {
    let p = makeLongProxyChain();
    Reflect.ownKeys(p);
});

shouldThrowStackOverflow(function longProxyChainGetPrototypeOf() {
    let p = makeLongProxyChain();
    Reflect.getPrototypeOf(p);
});

shouldThrowStackOverflow(function longProxyChainSetPrototypeOf() {
    let p = makeLongProxyChain();
    Reflect.setPrototypeOf(p, null);
});

shouldThrowStackOverflow(function longProxyChainGetOwnPropertyDescriptor() {
    let p = makeLongProxyChain();
    Reflect.getOwnPropertyDescriptor(p, "");
});

shouldThrowStackOverflow(function longProxyChainDefineProperty() {
    let p = makeLongProxyChain();
    Reflect.defineProperty(p, "", {});
});

shouldThrowStackOverflow(function longProxyChainIsExtensible() {
    let p = makeLongProxyChain();
    Reflect.isExtensible(p);
});

shouldThrowStackOverflow(function longProxyChainPreventExtensions() {
    let p = makeLongProxyChain();
    Reflect.preventExtensions(p)
});

shouldThrowStackOverflow(function longProxyChainDeleteProperty() {
    let p = makeLongProxyChain();
    Reflect.deleteProperty(p, "");
});

shouldThrowStackOverflow(function longProxyChainWithScope() {
    let p = makeLongProxyChain();
    with (p) {
        propertyLookup;
    }
});

shouldThrowStackOverflow(function longProxyChainWithScope2() {
    let p = makeLongProxyChain();
    with (p) {
        storeToProperty = 0;
    }
});

shouldThrowStackOverflow(function longProxyChainWithScope3() {
    let p = makeLongProxyChain();
    with (p) {
        someFunctionPropertyLookup()
    }
});

shouldThrowStackOverflow(function longProxyChainArrayPrototypePush() {
    let p = makeLongProxyChain();
    Array.prototype.push.call(p, 0);
});

shouldThrowStackOverflow(function longProxyChainWithScope4() {
    let p = makeLongProxyChain();
    with (p) {
        eval("");
    }
});

shouldThrowStackOverflow(function longProxyChainCall() {
    let p = makeLongProxyChain();
    p();
});

shouldThrowStackOverflow(function longProxyChainConstruct() {
    let p = makeLongProxyChain();
    new p;
});

shouldThrowStackOverflow(function longProxyChainHas() {
    let p = makeLongProxyChain();
    Reflect.has(p, "foo");
});
