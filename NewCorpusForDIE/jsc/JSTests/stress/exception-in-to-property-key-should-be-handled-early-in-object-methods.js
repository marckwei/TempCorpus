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


var propertyKey = {
    toString() {
        throw new Error("propertyKey.toString is called.");
    }
};

function shouldThrow(func, message) {
    var error = null;
    try {
        func();
    } catch (e) {
        error = e;
    }
    if (!error)
        throw new Error("not thrown.");
    if (String(error) !== message)
        throw new Error("bad error: " + String(error));
}

var object = {};

shouldThrow(function () {
    object.hasOwnProperty(propertyKey);
}, "Error: propertyKey.toString is called.");

shouldThrow(function () {
    Object.prototype.hasOwnProperty.call(null, propertyKey);
}, "Error: propertyKey.toString is called.");

shouldThrow(function () {
    Object.prototype.hasOwnProperty.call(null, 'ok');
}, "TypeError: null is not an object (evaluating 'Object.prototype.hasOwnProperty.call(null, 'ok')')");

shouldThrow(function () {
    object.propertyIsEnumerable(propertyKey);
}, "Error: propertyKey.toString is called.");

// ToPropertyKey is first, ToObject is following.
shouldThrow(function () {
    Object.prototype.propertyIsEnumerable.call(null, propertyKey);
}, "Error: propertyKey.toString is called.");

shouldThrow(function () {
    // ToPropertyKey is first, ToObject is following.
    Object.prototype.propertyIsEnumerable.call(null, 'ok');
}, "TypeError: null is not an object (evaluating 'Object.prototype.propertyIsEnumerable.call(null, 'ok')')");

shouldThrow(function () {
    object.__defineGetter__(propertyKey, function () {
        return 'NG';
    });
}, "Error: propertyKey.toString is called.");

if (Object.getOwnPropertyDescriptor(object, ''))
    throw new Error("bad descriptor");

shouldThrow(function () {
    object.__defineSetter__(propertyKey, function () {
        return 'NG';
    });
}, "Error: propertyKey.toString is called.");

if (Object.getOwnPropertyDescriptor(object, ''))
    throw new Error("bad descriptor");

shouldThrow(function () {
    object.__lookupGetter__(propertyKey);
}, "Error: propertyKey.toString is called.");

shouldThrow(function () {
    object.__lookupSetter__(propertyKey);
}, "Error: propertyKey.toString is called.");
