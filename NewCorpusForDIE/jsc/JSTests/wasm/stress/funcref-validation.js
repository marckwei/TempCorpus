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

(async function () {
  let bytes = readFile('./resources/funcref-validation.wasm', 'binary');
  let importObject = {
    m: {
      f0: new WebAssembly.Global({value: 'f32', mutable: true}, 0),
      f1: new WebAssembly.Global({value: 'f64', mutable: true}, 0),
      f2: 0,
      f3: new WebAssembly.Global({value: 'f64', mutable: true}, 0),
      f4: new WebAssembly.Global({value: 'i64', mutable: true}, 0n),
      f5: 0,
      f6: new WebAssembly.Global({value: 'anyfunc', mutable: true}, null),
      f7: undefined,
      ifn0() {},
      ifn1() {},
      ifn2() {},
      t0: new WebAssembly.Table({initial: 61, element: 'anyfunc'}),
      t1: new WebAssembly.Table({initial: 16, element: 'externref'}),
    },
  };
  let i = await WebAssembly.instantiate(bytes, importObject);
  i.instance.exports.fn3();
})();
