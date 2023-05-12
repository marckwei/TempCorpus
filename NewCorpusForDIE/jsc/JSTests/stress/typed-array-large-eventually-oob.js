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

//@ skip if $memoryLimited or $addressBits <= 32
//@ runDefault()
function getArrayLength(array)
{
    return array.length;
}
noInline(getArrayLength);
function getByVal(array, index)
{
    return array[index];
}
noInline(getByVal);
function putByVal(array, index, value)
{
    'use strict';
    array[index] = value;
}
noInline(putByVal);

let oneGiga = 1024 * 1024 * 1024;

function test(array, actualLength, string)
{
    for (var i = 0; i < 100000; ++i) {
        var l = getArrayLength(array);
        if (l != actualLength)
            throw ("Wrong array length: " + l + " instead of the expected " + actualLength + " in case " + string);
        var index = i;
        var value = i % 100;
        putByVal(array, index, value);
        var result = getByVal(array, index);
        if (result != value)
            throw ("Expected " + value + " but got " + result + " in case " + string);
    }
    var value = 42;
    var index = actualLength + 10;
    putByVal(array, index, value);
    var result = getByVal(array, index);
    if (result != undefined)
        throw ("In out-of-bounds case, expected undefined but got " + result + " in case " + string);
}

let threeGigs = 3 * oneGiga;
let fourGigs = 4 * oneGiga;

test(new Int8Array(threeGigs), threeGigs, "Int8Array/3GB");
test(new Uint8Array(fourGigs), fourGigs, "Uint8Array/4GB");
test(new Uint8ClampedArray(threeGigs), threeGigs, "Uint8ClampedArray/3GB");
