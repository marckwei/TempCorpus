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
        throw new Error(`bad value: ${String(actual)}`);
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

function checkProperty(object, name, value, attributes = { writable: true, enumerable: true, configurable: true })
{
    var desc = Object.getOwnPropertyDescriptor(object, name);
    shouldBe(!!desc, true);
    shouldBe(desc.writable, attributes.writable);
    shouldBe(desc.enumerable, attributes.enumerable);
    shouldBe(desc.configurable, attributes.configurable);
    shouldBe(desc.value, value);
}

{
    let result = Object.assign({}, RegExp);
    shouldBe(JSON.stringify(Object.getOwnPropertyNames(result).sort()), `[]`);
}
{
    let result = Object.assign({}, $vm.createCustomTestGetterSetter());
    shouldBe(JSON.stringify(Object.getOwnPropertyNames(result).sort()), `["customAccessor","customAccessorGlobalObject","customAccessorReadOnly","customFunction","customValue","customValue2","customValueGlobalObject","customValueNoSetter"]`);
}
{
    function Hello() { }
    let result = Object.assign(Hello, {
        ok: 42
    });

    shouldBe(JSON.stringify(Object.getOwnPropertyNames(result).sort()), `["length","name","ok","prototype"]`);
    checkProperty(result, "ok", 42);
}
{
    let result = Object.assign({ ok: 42 }, { 0: 0, 1: 1 });
    shouldBe(JSON.stringify(Object.getOwnPropertyNames(result).sort()), `["0","1","ok"]`);
    checkProperty(result, "ok", 42);
    checkProperty(result, "0", 0);
    checkProperty(result, "1", 1);
}
{
    let object = { 0: 0, 1: 1 };
    ensureArrayStorage(object);
    let result = Object.assign({ ok: 42 }, object);
    shouldBe(JSON.stringify(Object.getOwnPropertyNames(result).sort()), `["0","1","ok"]`);
    checkProperty(result, "ok", 42);
    checkProperty(result, "0", 0);
    checkProperty(result, "1", 1);
}
{
    let called = false;
    let result = Object.assign({}, {
        get hello() {
            called = true;
            return 42;
        }
    });
    shouldBe(JSON.stringify(Object.getOwnPropertyNames(result).sort()), `["hello"]`);
    shouldBe(called, true);
    checkProperty(result, "hello", 42);
}
{
    let object = {};
    Object.defineProperty(object, "__proto__", {
        value: 42,
        enumerable: true,
        writable: true,
        configurable: true
    });
    checkProperty(object, "__proto__", 42);
    shouldBe(JSON.stringify(Object.getOwnPropertyNames(object).sort()), `["__proto__"]`);
    let result = Object.assign({}, object);
    shouldBe(JSON.stringify(Object.getOwnPropertyNames(result).sort()), `[]`);
    shouldBe(Object.getOwnPropertyDescriptor(result, "__proto__"), undefined);
    shouldBe(result.__proto__, Object.prototype);
}
{
    let object = {};
    Object.defineProperty(object, "hello", {
        value: 42,
        writable: false,
        enumerable: true,
        configurable: false
    });
    checkProperty(object, "hello", 42, { writable: false, enumerable: true, configurable: false });
    shouldBe(JSON.stringify(Object.getOwnPropertyNames(object).sort()), `["hello"]`);
    shouldThrow(() => {
        Object.assign(object, { hello: 50 });
    }, `TypeError: Attempted to assign to readonly property.`);
}
{
    let counter = 0;
    let helloCalled = null;
    let okCalled = null;
    let source = {};
    source.hello = 42;
    source.ok = 52;
    checkProperty(source, "hello", 42);
    checkProperty(source, "ok", 52);
    shouldBe(JSON.stringify(Object.getOwnPropertyNames(source)), `["hello","ok"]`);

    let result = Object.assign({
        set hello(value) {
            this.__hello = value;
            helloCalled = counter++;
        },
        set ok(value) {
            this.__ok = value;
            okCalled = counter++;
        }
    }, source);
    checkProperty(result, "__hello", 42);
    checkProperty(result, "__ok", 52);
    shouldBe(JSON.stringify(Object.getOwnPropertyNames(result).sort()), `["__hello","__ok","hello","ok"]`);
    shouldBe(helloCalled, 0);
    shouldBe(okCalled, 1);
}
{
    let builtinPut = createBuiltin(`(function (obj, value) {
        @putByIdDirectPrivate(obj, "next", value);
    })`);
    let builtinGet = createBuiltin(`(function (obj) {
        return @getByIdDirectPrivate(obj, "next");
    })`);
    var object = {};
    var value = 42;
    builtinPut(object, value);
    shouldBe(typeof builtinGet(object), "number");
    let result = Object.assign({}, object);
    shouldBe(typeof builtinGet(result), "undefined");
}
{
    let object = {};
    let setterCalledWithValue = null;
    let result = Object.assign(object, {
        get hello() {
            Object.defineProperty(object, "added", {
                get() {
                    return 42;
                },
                set(value) {
                    setterCalledWithValue = value;
                }
            });
            return 0;
        }
    }, {
        added: "world"
    });
    shouldBe(result.added, 42);
    shouldBe(result.hello, 0);
    shouldBe(setterCalledWithValue, "world");
}
{
    let object = Object.freeze({ foo: 1 });
    shouldBe(Object.assign(object, {}), object);
}
{
    let object = Object.preventExtensions({ foo: 1 });
    shouldBe(Object.assign(object, { foo: 2 }), object);
    shouldBe(object.foo, 2);
}
{
    let object = Object.preventExtensions({ foo: 1 });
    shouldThrow(() => {
        Object.assign(object, { bar: 2 });
    }, `TypeError: Attempting to define property on object that is not extensible.`);
    shouldBe(object.bar, undefined);
}
