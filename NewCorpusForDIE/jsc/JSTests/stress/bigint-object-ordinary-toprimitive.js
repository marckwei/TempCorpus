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

const BigIntToString = BigInt.prototype.toString;
let toStringGets = 0;
let toStringCalls = 0;
let toStringFunction = function() { ++toStringCalls; return `${BigIntToString.call(this)}foo`; };
Object.defineProperty(BigInt.prototype, "toString", {
    get: () => { ++toStringGets; return toStringFunction; },
});

shouldBe("" + Object(1n), "1"); // hint: default
shouldThrow(() => { +Object(1n); }, "TypeError: Conversion from 'BigInt' to 'number' is not allowed."); // hint: number
shouldBe(`${Object(1n)}`, "1foo"); // hint: string

shouldBe(toStringGets, 1);
shouldBe(toStringCalls, 1);

const BigIntValueOf = BigInt.prototype.valueOf;
let valueOfGets = 0;
let valueOfCalls = 0;
let valueOfFunction = function() { ++valueOfCalls; return BigIntValueOf.call(this) * 2n; };
Object.defineProperty(BigInt.prototype, "valueOf", {
    get: () => { ++valueOfGets; return valueOfFunction; },
});

shouldBe(Object(1n) == 2n, true); // hint: default
shouldBe(Object(1n) + 1n, 3n); // hint: number
shouldBe({ "1foo": 1, "2": 2 }[Object(1n)], 1); // hint: string

shouldBe(toStringGets, 2);
shouldBe(toStringCalls, 2);
shouldBe(valueOfGets, 2);
shouldBe(valueOfCalls, 2);

toStringFunction = undefined;

shouldThrow(() => { 1 + Object(1n); }, "TypeError: Invalid mix of BigInt and other type in addition."); // hint: default
shouldBe(Object(1n) * 1n, 2n); // hint: number
shouldBe("".concat(Object(1n)), "2"); // hint: string

shouldBe(toStringGets, 3);
shouldBe(toStringCalls, 2);
shouldBe(valueOfGets, 5);
shouldBe(valueOfCalls, 5);

valueOfFunction = null;

shouldThrow(() => { new Date(Object(1n)); }, "TypeError: No default value"); // hint: default
shouldThrow(() => { Number(Object(1n)); }, "TypeError: No default value"); // hint: number
shouldThrow(() => { String(Object(1n)); }, "TypeError: No default value"); // hint: string

shouldBe(toStringGets, 6);
shouldBe(toStringCalls, 2);
shouldBe(valueOfGets, 8);
shouldBe(valueOfCalls, 5);
