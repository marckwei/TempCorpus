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

// Setting the getter only.  
(function () {
    let target = {};
    let called = false;
    let handler = {
        defineProperty: function(theTarget, propName, descriptor) {
            called = true;
            return Reflect.defineProperty(theTarget, propName, descriptor);
        }
    };

    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let result = Reflect.defineProperty(proxy, "x", {
            enumerable: true,
            configurable: true,
            get: function(){},
        });
        assert(result);
        assert(called);
        called = false;

        for (let obj of [target, proxy]) {
            let pDesc = Object.getOwnPropertyDescriptor(obj, "x");
            assert(typeof pDesc.get === "function");
            assert(typeof pDesc.set === "undefined");
            assert(pDesc.get.toString() === (function(){}).toString());
            assert(pDesc.configurable === true);
            assert(pDesc.enumerable === true);
        }
    }
})();

// Setting the setter only.  
(function () {
    let target = {};
    let called = false;
    let handler = {
        defineProperty: function(theTarget, propName, descriptor) {
            called = true;
            return Reflect.defineProperty(theTarget, propName, descriptor);
        }
    };

    let proxy = new Proxy(target, handler);
    for (let i = 0; i < 500; i++) {
        let result = Reflect.defineProperty(proxy, "x", {
            enumerable: true,
            configurable: true,
            set: function(x){},
        });
        assert(result);
        assert(called);
        called = false;

        for (let obj of [target, proxy]) {
            let pDesc = Object.getOwnPropertyDescriptor(obj, "x");
            assert(typeof pDesc.get === "undefined");
            assert(typeof pDesc.set === "function");
            assert(pDesc.set.toString() === (function(x){}).toString());
            assert(pDesc.configurable === true);
            assert(pDesc.enumerable === true);
        }
    }
})();
