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

function testTypeError(script, message) {
    var error = null;
    try {
        eval(script);
    } catch (e) {
        error = e;
    }
    if (!error)
        throw new Error("Expected type error not thrown by `" + script + "`");

    if (String(error) !== message)
        throw new Error("Bad error: " + String(error));
}

function testOK(script) {
    var error = null;
    try {
        eval(script);
    } catch (e) {
        error = e;
    }
    if (error)
        throw new Error("Bad error: " + String(error));
}

testTypeError(`({ } = null)`, "TypeError: Right side of assignment cannot be destructured");
testTypeError(`({ a } = null)`, "TypeError: Right side of assignment cannot be destructured");
testTypeError(`({ a: { b } = null } = { })`, "TypeError: Right side of assignment cannot be destructured");
testTypeError(`({ a: { b } } = { a: null })`, "TypeError: Right side of assignment cannot be destructured");
testTypeError(`({ } = undefined)`, "TypeError: Right side of assignment cannot be destructured");
testTypeError(`({ a } = undefined)`, "TypeError: Right side of assignment cannot be destructured");
testTypeError(`({ a: { b } = undefined } = { })`, "TypeError: Right side of assignment cannot be destructured");
testTypeError(`({ a: { b } } = { a: undefined })`, "TypeError: Right side of assignment cannot be destructured");

testOK(`({ } = 123)`);
testOK(`({ a } = 123)`);
testOK(`({ a: { b } = 123 } = { })`);
testOK(`({ a: { b } } = { a: 123 })`);

testOK(`({ } = 0.5)`);
testOK(`({ a } = 0.5)`);
testOK(`({ a: { b } = 0.5 } = { })`);
testOK(`({ a: { b } } = { a: 0.5 })`);

testOK(`({ } = NaN)`);
testOK(`({ a } = NaN)`);
testOK(`({ a: { b } = NaN } = { })`);
testOK(`({ a: { b } } = { a: NaN })`);

testOK(`({ } = true)`);
testOK(`({ a } = true)`);
testOK(`({ a: { b } = true } = { })`);
testOK(`({ a: { b } } = { a: true })`);

testOK(`({ } = {})`);
testOK(`({ a } = {})`);
testOK(`({ a: { b } = {} } = { })`);
testOK(`({ a: { b } } = { a: {} })`);

testOK(`({ } = [])`);
testOK(`({ a } = [])`);
testOK(`({ a: { b } = [] } = { })`);
testOK(`({ a: { b } } = { a: [] })`);

testOK(`({ } = /1/)`);
testOK(`({ a } = /1/)`);
testOK(`({ a: { b } = /1/ } = { })`);
testOK(`({ a: { b } } = { a: /1/ })`);

testOK(`({ } = makeMasquerader())`);
testOK(`({ a } = makeMasquerader())`);
testOK(`({ a: { b } = makeMasquerader() } = { })`);
testOK(`({ a: { b } } = { a: makeMasquerader() })`);
