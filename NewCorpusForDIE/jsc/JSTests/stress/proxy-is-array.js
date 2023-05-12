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
        throw new Error("Bad assertion.")
}

function test(f) {
    for (let i = 0; i < 500; i++)
        f();
}

test(function() {
    let proxy = new Proxy([], {});
    assert(Array.isArray(proxy));
});

test(function() {
    let {proxy, revoke} = Proxy.revocable([], {});
    assert(Array.isArray(proxy));

    revoke();
    let threw = false;
    try {
        Array.isArray(proxy);
    } catch(e) {
        threw = true;
        assert(e.toString() === "TypeError: Array.isArray cannot be called on a Proxy that has been revoked");
    }
    assert(threw);
});

test(function() {
    let proxyChain = new Proxy([], {});
    for (let i = 0; i < 400; i++)
        proxyChain = new Proxy(proxyChain, {});
    assert(Array.isArray(proxyChain));
});

test(function() {
    let proxyChain = new Proxy([], {});
    let revoke = null;
    for (let i = 0; i < 400; i++) {
        if (i !== 250) {
            proxyChain = new Proxy(proxyChain, {});
        } else {
            let result = Proxy.revocable(proxyChain, {});
            proxyChain = result.proxy;
            revoke = result.revoke;
        }
    }
    assert(Array.isArray(proxyChain));

    revoke();
    let threw = false;
    try {
        Array.isArray(proxyChain);
    } catch(e) {
        threw = true;
        assert(e.toString() === "TypeError: Array.isArray cannot be called on a Proxy that has been revoked");
    }
    assert(threw);
});
