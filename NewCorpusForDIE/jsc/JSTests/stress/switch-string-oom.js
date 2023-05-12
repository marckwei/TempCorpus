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

//@ requireOptions("--jitPolicyScale=0", "--useConcurrentJIT=0")
// This tests that when a switch(String) converts the String argument, it properly handles OOM

function test(createOOMString)
{
    var str = String.fromCharCode(365);
    if (createOOMString)
        str = str.padEnd(2147483644, '123');

    switch (str) {
    case "one":
        throw "Case \"one\", dhouldn't get here";
        break;
    case "two": 
        throw "Case \"two\", shouldn't get here";
        break;
    case "three":
        throw "Case \"three\", shouldn't get here";
        break;
    default:
        if (createOOMString)
            throw "Default case, shouldn't get here";
        break;
    }
}

function testLowerTiers()
{
    for (let i = 0; i < 200; i++) {
        try {
            test(true);
        } catch(e) {
            if (e != "RangeError: Out of memory")
                throw "Unexpecte error: \"" + e + "\"";
        }
    }
}

function testFTL()
{
    for (let i = 0; i < 1000; i++) {
        try {
            test(i >= 50);
        } catch(e) {
            if (e != "RangeError: Out of memory")
                throw "Unexpecte error: \"" + e + "\"";
        }
    }
}

testLowerTiers();
testFTL();
