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

function assert(b) {
    if (!b)
        throw new Error("Bad!");
}

function getIsLittleEndian() {
    let ab = new ArrayBuffer(2);
    let ta = new Int16Array(ab);
    ta[0] = 0x0102;
    let dv = new DataView(ab);
    return dv.getInt16(0, true) === 0x0102;
}

let isLittleEndian = getIsLittleEndian();

function adjustForEndianess(value) {
    if (isLittleEndian)
        return value;

    let ab = new ArrayBuffer(4);
    let ta = new Uint32Array(ab);
    ta[0] = value;
    let dv = new DataView(ab);
    return dv.getUint32(0, true);
}

function test() {
    function load(o, i) {
        return o.getUint8(i);
    }
    noInline(load);

    let ab = new ArrayBuffer(4);
    let ta = new Uint32Array(ab);
    ta[0] = adjustForEndianess(0xa070fa01);
    let dv = new DataView(ab);

    for (let i = 0; i < 1000; ++i) {
        assert(load(dv, 0) === 0x01);
    }

    transferArrayBuffer(ab);
    let e = null;
    try {
        load(dv, 0);
    } catch(err) {
        e = err;
    }
    assert(e instanceof TypeError);
}
test();


function test2() {
    function load(o, i) {
        return o.getUint8(i);
    }
    noInline(load);

    let ab = new ArrayBuffer(4);
    let ta = new Uint32Array(ab);
    ta[0] = adjustForEndianess(0xa070fa01);
    let dv = new DataView(ab);

    for (let i = 0; i < 10000; ++i) {
        assert(load(dv, 0) === 0x01);
    }

    transferArrayBuffer(ab);
    let e = null;
    try {
        load(dv, 0);
    } catch(err) {
        e = err;
    }
    assert(e instanceof TypeError);
}
test2();
