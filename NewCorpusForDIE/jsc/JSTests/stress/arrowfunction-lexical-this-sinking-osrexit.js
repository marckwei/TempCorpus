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

var newContext = {
  id : 'new-context'
};

// Should be invoced by call with substitute this by newContext
function sink (p, q) {
    var g = x => {
      // Check if arrow function store context
      if (this != newContext || this.id != newContext.id)
          throw 'Wrong context of arrow function #1';
      return x;
    };
    if (p) { if (q) OSRExit(); return g; }
    return x => {
      // Check if arrow function store context
      if (this != newContext || this.id != newContext.id)
          throw 'Wrong context of arrow function #2';
      return x;
    };
}
noInline(sink);

for (var i = 0; i < 10000; ++i) {
    var f = sink.call(newContext, true, false);// Substitute this
    var result = f(42);
    if (result != 42)
    throw "Error: expected 42 but got " + result;
}

// At this point, the function should be compiled down to the FTL

// Check that the function is properly allocated on OSR exit
var f = sink.call(newContext,true, true);// Substitute this
var result = f(42);
if (result != 42)
    throw "Error: expected 42 but got " + result;
