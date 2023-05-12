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

const createCustom = `
    var custom = $vm.createCustomTestGetterSetter();
`;

(function directCustomAccessorGet() {
    const other = runString(createCustom);
    const otherCustom = other.custom;

    for (let i = 0; i < 1e5; i++) {
        assert(otherCustom.customAccessorGlobalObject === other);
    }
})();

(function directCustomValueGet() {
    const other = runString(createCustom);
    const otherCustom = other.custom;

    for (let i = 0; i < 1e5; i++) {
        assert(otherCustom.customValueGlobalObject === other);
    }
})();

(function directCustomAccessorSet() {
    const other = runString(createCustom);
    const otherCustom = other.custom;

    for (let i = 0; i < 1e5; i++) {
        const value = {};
        otherCustom.customAccessorGlobalObject = value;
        assert(value.result === other);
    }
})();

(function directCustomValueSet() {
    const other = runString(createCustom);
    const otherCustom = other.custom;

    for (let i = 0; i < 1e5; i++) {
        const value = {};
        otherCustom.customValueGlobalObject = value;
        assert(value.result === other);
    }
})();

(function prototypeChainCustomAccessorGet() {
    const other = runString(createCustom);
    const otherCustomHeir = Object.create(other.custom);

    for (let i = 0; i < 1e5; i++) {
        assert(otherCustomHeir.customAccessorGlobalObject === other);
    }
})();

(function prototypeChainCustomValueGet() {
    const other = runString(createCustom);
    const otherCustomHeir = Object.create(other.custom);

    for (let i = 0; i < 1e5; i++) {
        assert(otherCustomHeir.customValueGlobalObject === other);
    }
})();

(function prototypeChainCustomAccessorSet() {
    const other = runString(createCustom);
    const otherCustomHeir = Object.create(other.custom);

    for (let i = 0; i < 1e5; i++) {
        const value = {};
        otherCustomHeir.customAccessorGlobalObject = value;
        assert(value.result === other);
    }
})();
