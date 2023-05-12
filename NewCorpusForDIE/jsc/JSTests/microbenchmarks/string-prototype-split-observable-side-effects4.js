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

function assert(testedValue, msg) {
    if (!testedValue)
        throw Error(msg);
}

// RegExp.prototype with overridden exec: Testing ES6 21.2.5.11: 19.b. Let z be ? RegExpExec(splitter, S).
(function () {
    let accesses = [];
    let origDescriptor = Object.getOwnPropertyDescriptor(RegExp.prototype, "exec");
    let origExec = origDescriptor.value;

    let obj = /it/;
    Object.defineProperty(RegExp.prototype, "exec", {
        value: function(str) {
            accesses.push("exec");
            return origExec.call(this, str);
        }
    });

    // The @@split slow path should call an internal version of substr. Make sure that
    // it's not calling the public version which can be overridden.
    String.prototype.substr = function(start, length) {
        throw Error("Should not call overridden substr");
    }

    // The @@split slow path should only call the internal version of includes. Make sure
    // that it's not calling the public version which can be overridden.
    String.prototype.includes = function(pattern) {
        throw Error("Should not call overridden includes");
    }

    assert(accesses == "", "unexpected call to overridden props");
    let result = "splitme".split(obj);
    assert(accesses == "exec,exec,exec,exec,exec,exec", "Property accesses do not match expectation");
    assert(result == "spl,me", "Unexpected result");
})();
