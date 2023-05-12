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

const importName = "pierOne";
const types = ["i32", "i64", "f32", "f64", "void"];
const typesNonVoid = ["i32", "i64", "f32", "f64"];
const swapType = (type, index) => types[(types.indexOf(type) + index) % types.length];
const swapTypeNonVoid = (type, index) => typesNonVoid[(typesNonVoid.indexOf(type) + index) % typesNonVoid.length];

const signatures = [
    { params: ["i32"], ret: "void" },
    { params: ["i64"], ret: "void" },
    { params: ["f32"], ret: "void" },
    { params: ["f64"], ret: "void" },
    { params: ["i32"], ret: "i32" },
    { params: ["i64"], ret: "i64" },
    { params: ["f32"], ret: "f32" },
    { params: ["f64"], ret: "f64" },
    { params: ["i32", "f32"], ret: "i32" },
    { params: ["f32", "i32"], ret: "i32" },
    { params: ["i64", "f64"], ret: "i64" },
    { params: ["f64", "i64"], ret: "i64" },
    { params: ["i32", "f32", "i32"], ret: "i32" },
    { params: ["i32", "f32", "i32"], ret: "i32" },
    { params: ["i64", "f64", "i64"], ret: "i64" },
    { params: ["i64", "f64", "i64"], ret: "i64" },
    { params: Array(32).fill("i32"), ret: "i64" },
    { params: Array(32).fill("i64"), ret: "i64" },
    { params: Array(32).fill("f32"), ret: "i64" },
    { params: Array(32).fill("f64"), ret: "i64" },
];

const makeImporter = signature => {
    const builder = (new Builder())
        .Type().End()
        .Import().Function("exports", importName, signature).End();
    return new WebAssembly.Module(builder.WebAssembly().get());
};

const makeImportee = signature => {
    const builder = (new Builder())
        .Type().End()
        .Function().End()
        .Export()
            .Function(importName)
        .End()
        .Code()
            .Function(importName, signature);
    switch (signature.ret) {
    case "i32": builder.I32Const(0); break;
    case "i64": builder.I64Const(0); break;
    case "f32": builder.F32Const(0); break;
    case "f64": builder.F64Const(0); break;
    case "void": break;
    }
    return new WebAssembly.Instance(new WebAssembly.Module(builder.Return().End().End().WebAssembly().get()));
};

(function BadSignatureDropStartParams() {
    for (let signature of signatures) {
        const importee = makeImportee(signature);
        for (let i = 1; i <= signature.params.length; ++i) {
            const badParamSignature = { params: signature.params.slice(i, signature.params.length), ret: signature.ret };
            const importer = makeImporter(badParamSignature);
            assert.throws(() => new WebAssembly.Instance(importer, importee), WebAssembly.LinkError, `imported function exports:${importName} signature doesn't match the provided WebAssembly function's signature (evaluating 'new WebAssembly.Instance(importer, importee)')`);
        }
    }
})();

(function BadSignatureDropEndParams() {
    for (let signature of signatures) {
        const importee = makeImportee(signature);
        for (let i = 1; i < signature.params.length; ++i) {
            const badParamSignature = { params: signature.params.slice(0, i), ret: signature.ret };
            const importer = makeImporter(badParamSignature);
            assert.throws(() => new WebAssembly.Instance(importer, importee), WebAssembly.LinkError, `imported function exports:${importName} signature doesn't match the provided WebAssembly function's signature (evaluating 'new WebAssembly.Instance(importer, importee)')`);
        }
    }
})();

(function BadSignatureSwapParam() {
    for (let signature of signatures) {
        const importee = makeImportee(signature);
        for (let signatureIndex = 0; signatureIndex < signature.length; ++signatureIndex) {
            for (let typeIndex = 1; typeIndex < typesNonVoid.length; ++typeIndex) {
                let badParams = signature.params.slice();
                badParams[signatureIndex] = swapTypeNonVoid(badParams[signatureIndex], typeIndex);
                const badParamSignature = { params: badParams, ret: signature.ret };
                const importer = makeImporter(badParamSignature);
                assert.throws(() => new WebAssembly.Instance(importer, importee), WebAssembly.LinkError, `imported function exports:${importName} signature doesn't match the provided WebAssembly function's signature (evaluating 'new WebAssembly.Instance(importer, importee)')`);
            }
        }
    }
})();

(function BadSignatureRet() {
    for (let signature of signatures) {
        const importee = makeImportee(signature);
        for (let typeIndex = 1; typeIndex < types.length; ++typeIndex) {
            const badParamSignature = { params: signature.params, ret: swapType(signature.ret, typeIndex) };
            const importer = makeImporter(badParamSignature);
            assert.throws(() => new WebAssembly.Instance(importer, importee), WebAssembly.LinkError, `imported function exports:${importName} signature doesn't match the provided WebAssembly function's signature (evaluating 'new WebAssembly.Instance(importer, importee)')`);
        }
    }
})();
