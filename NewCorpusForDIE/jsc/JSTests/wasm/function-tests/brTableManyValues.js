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

import Builder from '../Builder.js'
import * as assert from '../assert.js'

const b = new Builder();
b.Type().End()
    .Function().End()
    .Export().Function('f0').End()
    .Code()
    .Function('f0', { params: ["i32"], ret: "i32" }, ["i32"])
    .Block("i32", (b) =>
           b.Block("i32", (b) =>
                   b.Block("i32", (b) =>
                           b.Block("i32", (b) =>
                                   b.Block("i32", (b) =>
                                           b.I32Const(200)
                                           .GetLocal(0)
                                           .BrTable(3, 2, 1, 0, 4)
                                          ).I32Const(10)
                                   .I32Add()
                                   .Return()
                                  ).I32Const(11)
                           .I32Add()
                           .Return()
                          ).I32Const(12)
                   .I32Add()
                   .Return()
                  ).I32Const(13)
           .I32Add()
           .Return()
          ).I32Const(14)
    .I32Add()
    .Return()
    .End()
    .End()

const bin = b.WebAssembly().get();
const instance = new WebAssembly.Instance(new WebAssembly.Module(bin));
function testWasmModuleFunctions(...tests) {
    for (let i = 0; i < tests.length; i++) {
        const func = instance.exports['f' + i];
        for (let test of tests[i]) {
            let result = test[0].value;
            let args = test[1].map(x => x.value);
            assert.eq(result, func(...args));
        }
    }
}
testWasmModuleFunctions([[{type: "i32", value: 213 }, [{ type: "i32", value: 0 }]],
                                       [{type: "i32", value: 212 }, [{ type: "i32", value: 1 }]],
                                       [{type: "i32", value: 211 }, [{ type: "i32", value: 2 }]],
                                       [{type: "i32", value: 210 }, [{ type: "i32", value: 3 }]],
                                       [{type: "i32", value: 214 }, [{ type: "i32", value: 4 }]],
                                       [{type: "i32", value: 214 }, [{ type: "i32", value: 5 }]],
                                       [{type: "i32", value: 214 }, [{ type: "i32", value: -1 }]],
                                       [{type: "i32", value: 214 }, [{ type: "i32", value: -1000 }]]
                                      ]);
