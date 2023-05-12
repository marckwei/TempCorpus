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

description("Tests to make sure we correctly repack a Map with object keys");

var map = new Map();
function Obj(n) { this.n = n; }

map.set(new Obj(0), []);
map.set(new Obj(1), []);
map.set(new Obj(2), []);
map.set(new Obj(3), []);
map.set(new Obj(4), []);
map.set(new Obj(5), []);
map.set(new Obj(6), []);
map.set(new Obj(7), []);

var newObject1 = new Obj(8);
var newObject2 = new Obj(9);
map.set(newObject1, []);
map.set(newObject2, []);
map.delete(newObject1);
map.delete(newObject2);
map.set(newObject1, []);
map.set(newObject2, []);
map.delete(newObject1);
map.delete(newObject2);

map.set(newObject1, []);
shouldBeTrue("Array.isArray(map.get(newObject1))");

map.set(newObject2, []);
shouldBeTrue("Array.isArray(map.get(newObject1))"); // ensure pre-existing value is still good.
