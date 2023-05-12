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

function shouldThrow(func, errorMessage) {
    var errorThrown = false;
    try {
        func();
    } catch (error) {
        errorThrown = true;
        if (String(error) !== errorMessage)
            throw new Error(`bad error: ${error}`);
    }
    if (!errorThrown)
        throw new Error('not thrown');
}

var proxy1 = new Proxy({}, {
    set: (_, key) => key !== "length",
});

shouldThrow(() => {
    Array.prototype.unshift.call(proxy1);
}, "TypeError: Proxy object's 'set' trap returned falsy value for property 'length'");

var obj2 = Object.defineProperty({}, "length", {
    value: 22,
    writable: false,
    configurable: false,
});

var proxy2 = new Proxy(obj2, {
    set: () => true,
});

shouldThrow(() => {
    Array.prototype.shift.call(proxy2);
}, "TypeError: Proxy handler's 'set' on a non-configurable and non-writable property on 'target' should either return false or be the same value already on the 'target'");

var obj3 = Object.defineProperty({}, "length", {
    get: () => 33,
    configurable: false,
});

var proxy3 = new Proxy(obj3, {
    set: () => true,
});

shouldThrow(() => {
    Array.prototype.pop.call(proxy3);
}, "TypeError: Proxy handler's 'set' method on a non-configurable accessor property without a setter should return false");
