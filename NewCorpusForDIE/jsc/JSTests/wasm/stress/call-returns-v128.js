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

//@ skip unless $isSIMDPlatform
(async function () {
  let bytes0 = readFile('./resources/call-returns-v128.wasm', 'binary');
  let fn0 = function () {};
  let fn1 = fn0;
  let fn2 = fn0;
  let fn3 = fn0;
  let fn4 = fn0;
  let fn5 = fn0;
  let fn6 = fn0;
  let fn7 = fn0;
  let fn8 = fn0;
  let global0 = new WebAssembly.Global({value: 'externref', mutable: true}, {});
  let global1 = new WebAssembly.Global({value: 'i32', mutable: true}, 0);
  let global4 = new WebAssembly.Global({value: 'anyfunc', mutable: true}, null);
  let global5 = new WebAssembly.Global({value: 'anyfunc', mutable: true}, null);
  let memory0 = new WebAssembly.Memory({initial: 3325, shared: true, maximum: 5196});
  let table0 = new WebAssembly.Table({initial: 36, element: 'externref', maximum: 505});
  let table3 = new WebAssembly.Table({initial: 93, element: 'anyfunc', maximum: 465});
  let table4 = new WebAssembly.Table({initial: 91, element: 'externref', maximum: 564});
  let table6 = new WebAssembly.Table({initial: 41, element: 'anyfunc', maximum: 41});
  let m0 = {fn3, fn4, fn6, fn7, global0, global5, memory0, table2: table0, table5: table3, table6};
  let m1 = {fn2, global1, table0, table1: table0};
  let m2 = {fn0, fn1, fn5, fn8, global2: global1, global3: 0, global4, table3, table4};
  let importObject0 = {m0, m1, m2};
  let i0 = await WebAssembly.instantiate(bytes0, importObject0);
  let {fn27} = i0.instance.exports;
  fn27();
})().catch($vm.abort);
