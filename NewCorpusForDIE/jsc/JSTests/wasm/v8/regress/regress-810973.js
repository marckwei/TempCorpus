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

// Copyright 2018 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

  this.WScript = new Proxy({}, {
    get() {
      switch (name) {
      }
    }
  });
function MjsUnitAssertionError() {
};
let __v_692 = `(function module() { "use asm";function foo(`;
const __v_693 =
1005;
for (let __v_695 = 0; __v_695 < __v_693; ++__v_695) {
    __v_692 += `arg${__v_695},`;
}
try {
  __v_692 += `arg${__v_693}){`;
} catch (e) {}
for (let __v_696 = 0; __v_696 <= __v_693; ++__v_696) {
    __v_692 += `arg${__v_696}=+arg${__v_696};`;
}
  __v_692 += "return 10;}function bar(){return foo(";
for (let __v_697 = 0; __v_697 < __v_693; ++__v_697) {
    __v_692 += "0.0,";
}
  __v_692 += "1.0)|0;}";

__v_692 += "return bar})()()";

const __v_694 = eval(__v_692);
