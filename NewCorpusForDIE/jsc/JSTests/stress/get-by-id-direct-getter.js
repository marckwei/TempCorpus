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

var createBuiltin = $vm.createBuiltin;

function shouldBe(actual, expected) {
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
    var builtin = createBuiltin(`(function (obj) {
        return @getByIdDirect(obj, "hello");
    })`);
    noInline(builtin);

    var obj = { get hello() { return 42; }, world:33 };
    for (var i = 0; i < 1e4; ++i)
        shouldBe(builtin(obj), 42);

    var obj2 = { hello: 22 };
    for (var i = 0; i < 1e4; ++i) {
        shouldBe(builtin(obj), 42);
        shouldBe(builtin(obj2), 22);
    }

    var obj3 = { };
    for (var i = 0; i < 1e4; ++i)
        shouldBe(builtin(obj3), undefined);

    var obj4 = {
        __proto__: { hello: 33 }
    };
    for (var i = 0; i < 1e4; ++i)
        shouldBe(builtin(obj4), undefined);

    var target5 = "Hello";
    var target6 = 42;
    var target7 = false;
    var target8 = Symbol("Cocoa");
    for (var i = 0; i < 1e4; ++i) {
        shouldBe(builtin(target5), undefined);
        shouldBe(builtin(target6), undefined);
        shouldBe(builtin(target7), undefined);
        shouldBe(builtin(target8), undefined);
    }

    shouldThrow(() => {
        builtin(null);
    }, `TypeError: null is not an object`);

    shouldThrow(() => {
        builtin(undefined);
    }, `TypeError: undefined is not an object`);

    shouldBe(builtin(obj), 42);
    shouldBe(builtin(obj2), 22);
    shouldBe(builtin(obj3), undefined);
    shouldBe(builtin(obj4), undefined);
    shouldBe(builtin(target5), undefined);
    shouldBe(builtin(target6), undefined);
    shouldBe(builtin(target7), undefined);
    shouldBe(builtin(target8), undefined);
}());

(function () {
    var builtin = createBuiltin(`(function (obj) {
        return @getByIdDirect(obj, "hello");
    })`);
    noInline(builtin);

    var obj = { };
    for (var i = 0; i < 1e4; ++i)
        shouldBe(builtin(obj), undefined);
    shouldBe(builtin(obj), undefined);
    obj.hello = 42;
    shouldBe(builtin(obj), 42);
}());


(function () {
    var builtin = createBuiltin(`(function (obj) {
        return @getByIdDirect(obj, "length");
    })`);
    noInline(builtin);

    var array = [0, 1, 2];
    for (var i = 0; i < 1e4; ++i)
        shouldBe(builtin(array), 3);
    shouldBe(builtin({}), undefined);

    var obj = { length:2 };
    var obj2 = { get length() { return 2; } };
    for (var i = 0; i < 1e4; ++i) {
        shouldBe(builtin(array), 3);
        shouldBe(builtin(obj), 2);
        shouldBe(builtin(obj2), 2);
        shouldBe(builtin("Cocoa"), 5);
    }
}());
