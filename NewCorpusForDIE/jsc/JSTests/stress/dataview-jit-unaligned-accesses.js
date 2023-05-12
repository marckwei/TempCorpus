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

"use strict";

function assert(b, m = "") {
    if (!b)
        throw new Error("Bad: " + m);
}

let getOps = {
    getUint8: 1,
    getUint16: 2,
    getUint32: 4,
    getInt8: 1,
    getInt16: 2,
    getInt32: 4,
    getFloat32: 4,
    getFloat64: 8,
};

let setOps = {
    setUint8: 1,
    setUint16: 2,
    setUint32: 4,
    setInt8: 1,
    setInt16: 2,
    setInt32: 4,
    setFloat32: 4,
    setFloat64: 8,
};

let getFuncs = [];
for (let p of Object.keys(getOps)) {
    let endOfCall = getOps[p] === 1 ? ");" : ", true);";
    let str = `
        (function ${p}(dv, index) {
            return dv.${p}(index${endOfCall}
        })
    `;
       
    let func = eval(str);
    noInline(func);
    getFuncs.push(func);
}

let setFuncs = [];
for (let p of Object.keys(setOps)) {
    let endOfCall = setOps[p] === 1 ? ");" : ", true);";
    let str = `
        (function ${p}(dv, index, value) {
            dv.${p}(index, value${endOfCall}
        })
    `;

    let func = eval(str);
    noInline(func);
    setFuncs.push(func);
}

function test() {
    const size = 16*1024;
    let ab = new ArrayBuffer(size);
    let dv = new DataView(ab);
    for (let i = 0; i < 100000; ++i) {
        let index = (Math.random() * size) >>> 0;
        index = Math.max(index - 8, 0);
        for (let f of getFuncs) {
            f(dv, index);
        }

        for (let f of setFuncs) {
            f(dv, index, 10);
        }
    }

}
test();
