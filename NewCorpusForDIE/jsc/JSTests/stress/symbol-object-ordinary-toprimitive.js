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
    if (!Object.is(actual, expected))
        throw new Error(`Bad value: ${actual}!`);
}

function shouldThrow(func, expectedError) {
    let errorThrown = false;
    try {
        func();
    } catch (error) {
        errorThrown = true;
        if (error.toString() !== expectedError)
            throw new Error(`Bad error: ${error}!`);
    }
    if (!errorThrown)
        throw new Error("Didn't throw!");
}

(function toPrimitiveIsNull() {
    Object.defineProperty(Symbol.prototype, Symbol.toPrimitive, { value: null });

    for (let i = 0; i < 1e5; ++i) {
        shouldBe(Object(Symbol()) == "Symbol()", false); // hint: default
        shouldThrow(() => { +Object(Symbol()); }, "TypeError: Cannot convert a symbol to a number"); // hint: number
        shouldBe(`${Object(Symbol())}`, "Symbol()"); // hint: string
    }
})();

(function toPrimitiveIsUndefined() {
    Object.defineProperty(Symbol.prototype, Symbol.toPrimitive, { value: undefined });

    for (let i = 0; i < 1e5; ++i) {
        shouldBe(Object(Symbol.iterator) != Symbol.iterator, false); // hint: default
        shouldThrow(() => { Object(Symbol()) <= ""; }, "TypeError: Cannot convert a symbol to a number"); // hint: number
        shouldBe({ "Symbol()": 1 }[Object(Symbol())], 1); // hint: string
    }
})();

delete Symbol.prototype[Symbol.toPrimitive];

let valueOfGets = 0;
let valueOfCalls = 0;
let valueOfFunction = () => { ++valueOfCalls; return 123; };
Object.defineProperty(Symbol.prototype, "valueOf", {
    get: () => { ++valueOfGets; return valueOfFunction; },
});

shouldBe(Object(Symbol()) == 123, true); // hint: default
shouldBe(Object(Symbol()) - 0, 123); // hint: number
shouldBe("".concat(Object(Symbol())), "Symbol()"); // hint: string

shouldBe(valueOfGets, 2);
shouldBe(valueOfCalls, 2);

let toStringGets = 0;
let toStringCalls = 0;
let toStringFunction = () => { ++toStringCalls; return "foo"; };
Object.defineProperty(Symbol.prototype, "toString", {
    get: () => { ++toStringGets; return toStringFunction; },
});

shouldBe("" + Object(Symbol()), "123"); // hint: default
shouldBe(Object(Symbol()) * 1, 123); // hint: number
shouldBe({ "123": 1, "Symbol()": 2, "foo": 3 }[Object(Symbol())], 3); // hint: string

shouldBe(valueOfGets, 4);
shouldBe(valueOfCalls, 4);
shouldBe(toStringGets, 1);
shouldBe(toStringCalls, 1);

valueOfFunction = null;

shouldBe(new Date(Object(Symbol())).getTime(), NaN); // hint: default
shouldBe(+Object(Symbol()), NaN); // hint: number
shouldBe(`${Object(Symbol())}`, "foo"); // hint: string

shouldBe(valueOfGets, 6);
shouldBe(valueOfCalls, 4);
shouldBe(toStringGets, 4);
shouldBe(toStringCalls, 4);

toStringFunction = function() { throw new Error("toString()"); };

shouldThrow(() => { Object(Symbol()) != 123; }, "Error: toString()"); // hint: default
shouldThrow(() => { Object(Symbol()) / 0; }, "Error: toString()"); // hint: number
shouldThrow(() => { "".concat(Object(Symbol())); }, "Error: toString()"); // hint: string

shouldBe(valueOfGets, 8);
shouldBe(valueOfCalls, 4);
shouldBe(toStringGets, 7);
shouldBe(toStringCalls, 4);

toStringFunction = undefined;

shouldThrow(() => { 1 + Object(Symbol()); }, "TypeError: No default value"); // hint: default
shouldThrow(() => { Number(Object(Symbol())); }, "TypeError: No default value"); // hint: number
shouldThrow(() => { String(Object(Symbol())); }, "TypeError: No default value"); // hint: string

shouldBe(valueOfGets, 11);
shouldBe(valueOfCalls, 4);
shouldBe(toStringGets, 10);
shouldBe(toStringCalls, 4);
