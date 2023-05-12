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

async function throwExn() {
    throw new Error();
}

async function test() {
    const loopDepth = 10;
    const numCompilations = 1;
    const numVars = 30;
    const params = [];
    params.length = numVars;
    params.fill("i32");

    let builder = (new Builder())
          .Type().End()
          .Function().End()
          .Export()
              .Function("foo")
          .End()
          .Code()
          .Function("foo", { params, ret: "i32" });

    const makeLoop = (builder, depth) => {
        if (depth === 0)
            return builder;

        builder = builder
            .Loop("i32", (b) => {
                  b.GetLocal(0)
                    .I32Const(1)
                    .I32Sub()
                    .TeeLocal(0)
                    .GetLocal(0)
                    .I32Eqz()
                    .BrIf(1);

                return makeLoop(b, depth - 1).Br(0);
            });
        return builder

    }

    builder = makeLoop(builder, loopDepth);
    builder = builder.End().End();

    const bin = builder.WebAssembly().get();

    let compilations = [];
    for (let i = 0; i < numCompilations; ++i) {
        compilations.push(WebAssembly.compile(bin));
    }

    await Promise.all(compilations);
}

assert.asyncTest(test());
