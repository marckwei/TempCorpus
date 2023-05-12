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

function test() {

// Array.prototype methods -> Get -> [[Get]]
var methods = ['copyWithin', 'every', 'fill', 'filter', 'find', 'findIndex', 'forEach',
  'indexOf', 'join', 'lastIndexOf', 'map', 'reduce', 'reduceRight', 'some'];
var get;
var p = new Proxy({length: 2, 0: '', 1: ''}, { get: function(o, k) { get.push(k); return o[k]; }});
for(var i = 0; i < methods.length; i+=1) {
  get = [];
  Array.prototype[methods[i]].call(p, Function());
  if (get + '' !== (
    methods[i] === 'fill' ? "length" :
    methods[i] === 'every' ? "length,0" :
    methods[i] === 'lastIndexOf' || methods[i] === 'reduceRight' ? "length,1,0" :
    "length,0,1"
  )) {
    return false;
  }
}
return true;
      
}

if (!test())
    throw new Error("Test failed");

