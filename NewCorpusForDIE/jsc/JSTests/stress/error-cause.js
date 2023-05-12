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
        throw new Error(`expected ${expected} but got ${actual}`);
}

const errorConstructors = [Error, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, URIError, AggregateError];
if (typeof WebAssembly !== 'undefined')
    errorConstructors.push(WebAssembly.CompileError, WebAssembly.LinkError, WebAssembly.RuntimeError);

const constructError = (E, ...args) => E === AggregateError ? new E([], '', ...args) : new E('', ...args);

for (const E of errorConstructors) {
    shouldBe(constructError(E).cause, undefined);
    shouldBe(constructError(E, undefined).cause, undefined);
    shouldBe(constructError(E, null).cause, undefined);
    shouldBe(constructError(E, true).cause, undefined);
    shouldBe(constructError(E, 3).cause, undefined);
    shouldBe(constructError(E, 'hi').cause, undefined);
    shouldBe(constructError(E, {}).cause, undefined);

    shouldBe(constructError(E, { cause: undefined }).cause, undefined);
    shouldBe(constructError(E, { cause: null }).cause, null);
    shouldBe(constructError(E, { cause: true }).cause, true);
    shouldBe(constructError(E, { cause: 3 }).cause, 3);
    shouldBe(constructError(E, { cause: 'hi' }).cause, 'hi');

    const cause = new Error();
    shouldBe(constructError(E, { cause }).cause, cause);
}
