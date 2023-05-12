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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

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

shouldBe(Reflect.getOwnPropertyDescriptor.length, 2);

var toPropertyKey = {
    toString() {
        throw new Error("ok");
    }
};

shouldThrow(() => {
    Reflect.getOwnPropertyDescriptor("hello", 42);
}, `TypeError: Reflect.getOwnPropertyDescriptor requires the first argument be an object`);

shouldThrow(() => {
    Reflect.getOwnPropertyDescriptor("hello", toPropertyKey);
}, `TypeError: Reflect.getOwnPropertyDescriptor requires the first argument be an object`);

shouldThrow(() => {
    Reflect.getOwnPropertyDescriptor(null, toPropertyKey);
}, `TypeError: Reflect.getOwnPropertyDescriptor requires the first argument be an object`);

shouldThrow(() => {
    Reflect.getOwnPropertyDescriptor(undefined, toPropertyKey);
}, `TypeError: Reflect.getOwnPropertyDescriptor requires the first argument be an object`);

shouldThrow(() => {
    Reflect.getOwnPropertyDescriptor({}, toPropertyKey);
}, `Error: ok`);

shouldBe(Reflect.getOwnPropertyDescriptor({ __proto__: { hello: 42 } }, "hello"), undefined);
shouldBe(JSON.stringify(Reflect.getOwnPropertyDescriptor({ hello: 42 }, "hello")), `{"value":42,"writable":true,"enumerable":true,"configurable":true}`);

(function () {
    var object = {
        get hello() {
        }
    };
    var desc = Reflect.getOwnPropertyDescriptor(object, "hello");
    shouldBe(JSON.stringify(desc), `{"enumerable":true,"configurable":true}`);
    shouldBe(desc.set, undefined);
    shouldBe(desc.get, Object.getOwnPropertyDescriptor(object, "hello").get);
}());

(function () {
    var object = {
        set hello(value) {
        }
    };
    var desc = Reflect.getOwnPropertyDescriptor(object, "hello");
    shouldBe(JSON.stringify(desc), `{"enumerable":true,"configurable":true}`);
    shouldBe(desc.set, Object.getOwnPropertyDescriptor(object, "hello").set);
    shouldBe(desc.get, undefined);
}());

(function () {
    var object = Object.defineProperty({}, "hello", {
        enumerable: false,
        value: 42
    });
    var desc = Reflect.getOwnPropertyDescriptor(object, "hello");
    shouldBe(JSON.stringify(desc), `{"value":42,"writable":false,"enumerable":false,"configurable":false}`);
}());

(function () {
    var object = Object.defineProperty({}, "hello", {
        enumerable: false,
        configurable: true,
        value: 42
    });
    var desc = Reflect.getOwnPropertyDescriptor(object, "hello");
    shouldBe(JSON.stringify(desc), `{"value":42,"writable":false,"enumerable":false,"configurable":true}`);
}());

(function () {
    var object = Object.defineProperty({}, "hello", {
        enumerable: true,
        configurable: false,
        value: 42
    });
    var desc = Reflect.getOwnPropertyDescriptor(object, "hello");
    shouldBe(JSON.stringify(desc), `{"value":42,"writable":false,"enumerable":true,"configurable":false}`);
}());

(function () {
    var object = Object.defineProperty({}, "hello", {
        enumerable: true,
        configurable: false,
        writable: false,
        value: 42
    });
    var desc = Reflect.getOwnPropertyDescriptor(object, "hello");
    shouldBe(JSON.stringify(desc), `{"value":42,"writable":false,"enumerable":true,"configurable":false}`);
}());

(function () {
    var object = Object.defineProperty({}, "hello", {
        enumerable: true,
        configurable: false,
        writable: true,
        value: 42
    });
    var desc = Reflect.getOwnPropertyDescriptor(object, "hello");
    shouldBe(JSON.stringify(desc), `{"value":42,"writable":true,"enumerable":true,"configurable":false}`);
}());

(function () {
    var object = {
        get hello() {
        },
        set hello(value) {
        }
    };
    var desc = Reflect.getOwnPropertyDescriptor(object, "hello");
    shouldBe(JSON.stringify(desc), `{"enumerable":true,"configurable":true}`);
    shouldBe(desc.get, Object.getOwnPropertyDescriptor(object, "hello").get);
    shouldBe(desc.set, Object.getOwnPropertyDescriptor(object, "hello").set);
}());

(function () {
    var object = {
        get hello() {
        },
        set hello(value) {
        }
    };
    var desc = Reflect.getOwnPropertyDescriptor(object, { toString() { return "hello"; } });
    shouldBe(JSON.stringify(desc), `{"enumerable":true,"configurable":true}`);
    shouldBe(desc.get, Object.getOwnPropertyDescriptor(object, "hello").get);
    shouldBe(desc.set, Object.getOwnPropertyDescriptor(object, "hello").set);
}());
