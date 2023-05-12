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

import * as assert from '../assert.js';
import Builder from '../Builder.js';

async function test() {
    let params = [];
    for (let i = 0; i < 50; ++i)
        params.push('f64');

    let cont = (new Builder())
        .Type().End()
        .Function().End()
        .Export()
            .Function("foo")
        .End()
        .Code()
        .Function("foo", { params: params, ret: "f64" });
    for (let i = 0; i < 50; ++i)
        cont = cont.GetLocal(i);
    for (let i = 0; i < 49; ++i)
        cont = cont.F64Add();
    let builder = cont.Return()
        .End()
        .End();

    const bin = builder.WebAssembly().get();
    const {instance} = await WebAssembly.instantiate(bin, {});

    for (let i = 0; i < 1000000; i++) {
        assert.eq(instance.exports.foo(
            0.1,1.1,2.1,3.1,4.1,5.1,6.1,7.1,8.1,9.1,
            10.1,11.1,12.1,13.1,14.1,15.1,16.1,17.1,18.1,19.1,
            20.1,21.1,22.1,23.1,24.1,25.1,26.1,27.1,28.1,29.1,
            30.1,31.1,32.1,33.1,34.1,35.1,36.1,37.1,38.1,39.1,
            40.1,41.1,42.1,43.1,44.1,45.1,46.1,47.1,48.1,49.1,
        ), 1229.9999999999986);
    }
}

assert.asyncTest(test());
