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

function f(a,b,c) {
   var d, e;
   var args = "";
   for (var i = 0; i < arguments.length; i++)
       args+=arguments[i]+ ((i == arguments.length - 1) ? "" : ", ");
   return args;
}
var a = 0;
var b = 0;
var c = 0;
var d = 0;
shouldBe('eval("f()")', '""');
shouldBe('eval("f(1)")', '"1"');
shouldBe('eval("f(1, 2)")', '"1, 2"');
shouldBe('eval("f(1, 2, 3)")', '"1, 2, 3"');
shouldBe('eval("f(1, 2, 3, 4)")', '"1, 2, 3, 4"');
shouldBe('eval("f(1, 2, 3, 4, 5)")', '"1, 2, 3, 4, 5"');
shouldBe('eval("f(1, 2, 3, 4, 5, 6)")', '"1, 2, 3, 4, 5, 6"');
