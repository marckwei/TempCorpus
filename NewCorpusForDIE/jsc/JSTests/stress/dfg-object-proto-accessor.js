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

function shouldBe(actual, expected)
{
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

function shouldThrow(func, errorMessage) {
    var errorThrown = false;
    var error = null;
    try {
        func();
    } catch (e) {
        errorThrown = true;
        error = e;
    }
    if (!errorThrown)
        throw new Error('not thrown');
    if (String(error) !== errorMessage)
        throw new Error(`bad error: ${String(error)}`);
}

(function () {
    function target(object)
    {
        return object.__proto__;
    }
    noInline(target);

    for (var i = 0; i < 1e3; ++i)
        shouldBe(target({}), Object.prototype);
}());

(function () {
    function target(object)
    {
        return object.__proto__;
    }
    noInline(target);

    for (var i = 0; i < 1e3; ++i) {
        shouldThrow(() => target(null), `TypeError: null is not an object (evaluating 'object.__proto__')`);
        shouldThrow(() => target(undefined), `TypeError: undefined is not an object (evaluating 'object.__proto__')`);
    }
}());

(function () {
    function target(object)
    {
        return object.__proto__;
    }
    noInline(target);

    for (var i = 0; i < 1e3; ++i)
        shouldBe(target("Cocoa"), String.prototype);
}());

(function () {
    function target(object)
    {
        return object.__proto__;
    }
    noInline(target);

    for (var i = 0; i < 1e3; ++i)
        shouldBe(target(42), Number.prototype);
}());

(function () {
    function target(object)
    {
        return object.__proto__;
    }
    noInline(target);

    for (var i = 0; i < 1e3; ++i)
        shouldBe(target(42.195), Number.prototype);
}());

(function () {
    function target(object)
    {
        return object.__proto__;
    }
    noInline(target);

    for (var i = 0; i < 1e3; ++i)
        shouldBe(target(true), Boolean.prototype);
}());

(function () {
    function target(object)
    {
        return object.__proto__;
    }
    noInline(target);

    for (var i = 0; i < 1e3; ++i)
        shouldBe(target(Symbol("Cocoa")), Symbol.prototype);
}());

(function () {
    function target(object)
    {
        return object.__proto__;
    }
    noInline(target);

    for (var i = 0; i < 1e3; ++i) {
        shouldBe(target("Cocoa"), String.prototype);
        shouldBe(target(42), Number.prototype);
        shouldBe(target(42.195), Number.prototype);
        shouldBe(target(true), Boolean.prototype);
        shouldBe(target(Symbol("Cocoa")), Symbol.prototype);
    }
}());
