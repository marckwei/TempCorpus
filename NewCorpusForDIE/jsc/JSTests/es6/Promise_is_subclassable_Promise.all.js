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
var passed = false;
function asyncTestPassed() {
    passed = true;
}

class P extends Promise {}
var fulfills = P.all([
  new Promise(function(resolve)   { setTimeout(resolve,200,"foo"); }),
  new Promise(function(resolve)   { setTimeout(resolve,100,"bar"); }),
]);
var rejects = P.all([
  new Promise(function(_, reject) { setTimeout(reject, 200,"baz"); }),
  new Promise(function(_, reject) { setTimeout(reject, 100,"qux"); }),
]);
var score = +(fulfills instanceof P);
fulfills.then(function(result) { score += (result + "" === "foo,bar"); check(); });
rejects.catch(function(result) { score += (result === "qux"); check(); });

function check() {
  if (score === 3) asyncTestPassed();
}
      
drainMicrotasks();
return passed;
}

if (!test())
    throw new Error("Test failed");

