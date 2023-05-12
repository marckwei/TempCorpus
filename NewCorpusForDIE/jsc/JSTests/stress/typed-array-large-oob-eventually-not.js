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

//@ skip
// This tests takes >4s even in release mode on an M1 MBP, so I'd rather avoid running it on EWS by default.

let oneGiga = 1024 * 1024 * 1024;

function test(array, actualLength, string)
{
    for (var i = 0; i < 1000000; ++i) {
        var index = actualLength + 10;
        var value = 42;
        array[index] = value;
        var result = array[index];
        if (result != undefined)
            throw ("Expected " + value + " but got " + result + " in case " + string);
    }
    var value = 42;
    var index = 10;
    array[index] = value;
    var result = array[index]
    if (result != value)
        throw ("In out-of-bounds case, expected undefined but got " + result + " in case " + string);
}

let threeGigs = 3 * oneGiga;
let fourGigs = 4 * oneGiga;

test(new Int8Array(threeGigs), threeGigs, "Int8Array/3GB");
test(new Uint8Array(fourGigs), fourGigs, "Uint8Array/4GB");
test(new Uint8ClampedArray(threeGigs), threeGigs, "Uint8ClampedArray/3GB");
