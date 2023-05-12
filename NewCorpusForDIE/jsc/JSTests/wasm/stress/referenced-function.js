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

let bytes = readFile('./resources/funcref-race.wasm', 'binary');
(async function () {
    let importObject = {
        m: {
            ifn0() { },
            ifn1() { },
            ifn2() { },
            t0: new WebAssembly.Table({ initial: 18, element: 'externref' }),
            t1: new WebAssembly.Table({ initial: 84, element: 'anyfunc' }),
            t2: new WebAssembly.Table({ initial: 2, element: 'externref' }),
            t3: new WebAssembly.Table({ initial: 6, element: 'anyfunc' }),
            t4: new WebAssembly.Table({ initial: 67, element: 'anyfunc', maximum: 579 }),
            t5: new WebAssembly.Table({ initial: 39, element: 'externref', maximum: 690 }),
        },
    };
    for (let j = 0; j < 1000; j++) {
        try {
            let i = await WebAssembly.instantiate(bytes, importObject);
            i.instance.exports.fn10();
        } catch (e) {
        }
    }
})();
