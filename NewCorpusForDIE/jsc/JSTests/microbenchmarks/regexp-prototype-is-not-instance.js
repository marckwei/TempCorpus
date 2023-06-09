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

//@ skip if $model == "Apple Watch Series 3" # added by mark-jsc-stress-test.py
//@ runNoFTL

function stringify(x) {
    if (typeof x == "string")
        return '"' + x + '"';
    return x;
}

function assert(actual, expected) {
    if (actual !== expected)
        throw Error("FAIL: expected " + stringify(expected) + ", actual " + stringify(actual));
}

function assertThrows(func, expectedErrMsg) {
    let actualErrMsg;
    try {
        func();
        throw("FAIL: did not throw");
    } catch(e) {
        actualErrMsg = e.toString();
    }
    assert(actualErrMsg, expectedErrMsg);
}

assert(RegExp.prototype instanceof RegExp, false);

assert(RegExp.prototype.flags, "");
assert(RegExp.prototype.global, void 0);
assert(RegExp.prototype.ignoreCase, void 0);
assert(RegExp.prototype.multiline, void 0);
assert(RegExp.prototype.unicode, void 0);
assert(RegExp.prototype.sticky, void 0);
assert(RegExp.prototype.source, "(?:)");
assert(RegExp.prototype.toString(), "/(?:)/");

assert(Object.getOwnPropertyDescriptor(RegExp.prototype, 'flags').get.call({}), "");

assertThrows(() => {
        Object.getOwnPropertyDescriptor(RegExp.prototype, 'flags').get.call(1);
    }, 
    "TypeError: The RegExp.prototype.flags getter can only be called on an object");

assertThrows(() => {
        Object.getOwnPropertyDescriptor(RegExp.prototype, 'ignoreCase').get.call({});
    },
    "TypeError: The RegExp.prototype.ignoreCase getter can only be called on a RegExp object");

assertThrows(() => {
        Object.getOwnPropertyDescriptor(RegExp.prototype, 'multiline').get.call({});
    },
    "TypeError: The RegExp.prototype.multiline getter can only be called on a RegExp object");

assertThrows(() => {
        Object.getOwnPropertyDescriptor(RegExp.prototype, 'unicode').get.call({});
    },
    "TypeError: The RegExp.prototype.unicode getter can only be called on a RegExp object");

assertThrows(() => {
        Object.getOwnPropertyDescriptor(RegExp.prototype, 'sticky').get.call({});
    },
    "TypeError: The RegExp.prototype.sticky getter can only be called on a RegExp object");

assertThrows(() => {
        Object.getOwnPropertyDescriptor(RegExp.prototype, 'source').get.call({});
    },
    "TypeError: The RegExp.prototype.source getter can only be called on a RegExp object");

assertThrows(() => {
        Object.getOwnPropertyDescriptor(RegExp.prototype, 'toString').get.call({});
    },
    "TypeError: undefined is not an object (evaluating 'Object.getOwnPropertyDescriptor(RegExp.prototype, 'toString').get.call')");
