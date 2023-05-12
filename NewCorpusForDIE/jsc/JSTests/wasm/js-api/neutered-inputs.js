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

import * as assert from "../assert.js";

const fail = val => { throw new Error(`Expected promise to fail, instead got ${val}`); };
const catcher = (errType, errMessage) => err => {
    assert.eq(errType, err);
    assert.eq(errMessage, err.message);
};

let neuteredArray = new Uint8Array(1);
transferArrayBuffer(neuteredArray.buffer);

const testAsyncFunction = func => {
    func(neuteredArray).then(fail).catch(catcher(TypeError, "Underlying ArrayBuffer has been detached from the view or out-of-bounds"));
    func(neuteredArray.buffer).then(fail).catch(catcher(TypeError, "Underlying ArrayBuffer has been detached from the view or out-of-bounds"));
};

const testFunction = func => {
    assert.throws(() => func(neuteredArray), TypeError, "Underlying ArrayBuffer has been detached from the view or out-of-bounds");
    assert.throws(() => func(neuteredArray.buffer), TypeError, "Underlying ArrayBuffer has been detached from the view or out-of-bounds");
};

const testConstructor = func => {
    assert.throws(() => new func(neuteredArray), TypeError, "Underlying ArrayBuffer has been detached from the view or out-of-bounds");
    assert.throws(() => new func(neuteredArray.buffer), TypeError, "Underlying ArrayBuffer has been detached from the view or out-of-bounds");
};

testConstructor(WebAssembly.Module);
testAsyncFunction(WebAssembly.compile);
testFunction(WebAssembly.validate);
testAsyncFunction(WebAssembly.instantiate);
