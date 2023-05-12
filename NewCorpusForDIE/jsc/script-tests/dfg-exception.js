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

description(
"This tests that exceptions are thrown correctly."
);

// A large function containing a try/catch - this prevent DFG compilation.
function doesntDFGCompile()
{
    function callMe() {};

    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);

    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);

    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);

    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);

    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);
    callMe(0,1,2,3,4,5,6,7,8,9);

    try {
        return 1;
    } catch (e) {
        return 2;
    }
};

function test(x)
{
    return x();
};

noInline(test);
noInline(doesntDFGCompile);

// warmup the test method
while (!dfgCompiled({f:test}))
    test(doesntDFGCompile);

//
var caughtException = false;
try {
    test();
} catch (e) {
    caughtException = true;
}

shouldBe("caughtException", 'true');
var successfullyParsed = true;
