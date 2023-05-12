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

description("This tests that the various subscript operators handle subscript string conversion exceptions correctly.");

var toStringThrower = { toString: function() { throw "Exception thrown by toString"; }};
var target = {"" : "Did not assign to property when setter subscript threw"};

try {
    target[toStringThrower] = "Assigned to property on object when subscript threw";
} catch(e) {
    testPassed("PASS: Exception caught -- " + e);
}
shouldBe('target[""]', "'Did not assign to property when setter subscript threw'");

target[""] = "Did not delete property when subscript threw";
try {
    delete target[toStringThrower];
} catch(e) {
    testPassed("PASS: Exception caught -- " + e);
}
shouldBe('target[""]', "'Did not delete property when subscript threw'");

delete target[""];

target.__defineGetter__("", function(){
                                testFailed('FAIL: Loaded property from object when subscript threw.');
                                return "FAIL: Assigned to result when subscript threw.";
                            });
var localTest = "Did not assign to result when subscript threw.";
try {
    localTest = target[toStringThrower];
} catch(e) {
    testPassed("PASS: Exception caught -- " + e);
}
shouldBe('localTest', "'Did not assign to result when subscript threw.'");
