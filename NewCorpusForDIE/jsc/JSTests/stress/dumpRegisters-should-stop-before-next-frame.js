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

//@ runNoisyTestDefault

if (0) {
  let z0 = []; let z1 = []; let z2 = []; let z3 = []; let z4 = []; let z5 = []; let z6 = []; let z7 = []; let z8 = []; let z9 = []; 
  let z10 = []; let z11 = []; let z12 = []; let z13 = []; let z14 = []; let z15 = []; let z16 = []; let z17 = []; let z18 = []; 
  let z19 = []; let z20 = []; let z21 = []; let z22 = []; let z23 = []; let z24 = []; let z25 = []; let z26 = []; let z27 = []; 
  let z28 = []; let z29 = []; let z30 = []; let z31 = []; let z32 = []; let z33 = []; let z34 = []; let z35 = []; let z36 = []; 
  let z37 = []; let z38 = []; let z39 = []; let z40 = []; let z41 = []; let z42 = []; let z43 = []; let z44 = []; let z45 = []; 
  let z46 = []; let z47 = []; let z48 = []; let z49 = []; let z50 = []; let z51 = []; let z52 = []; let z53 = []; let z54 = []; 
  let z55 = []; let z56 = []; let z57 = []; let z58 = []; let z59 = []; let z60 = []; let z61 = []; let z62 = []; let z63 = []; 
  let z64 = []; let z65 = []; let z66 = []; let z67 = []; let z68 = []; let z69 = []; let z70 = [];
  for (let q of []) {}
}
[];
$vm.dumpRegisters();
