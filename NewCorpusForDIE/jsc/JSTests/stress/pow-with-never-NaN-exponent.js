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

function exponentIsNonNanDouble1(x, doubleArrayIndex) {
    var doubleArray = [4.4];
    return x ** doubleArray[doubleArrayIndex];
}
noInline(exponentIsNonNanDouble1);

function exponentIsNonNanDouble2(x, doubleArray) {
    return x ** doubleArray[0];
}
noInline(exponentIsNonNanDouble2);

function testExponentIsDoubleConstant() {
    for (var i = 0; i < 10000; ++i) {
        var result = exponentIsNonNanDouble1(2, 0);
        if (result !== 21.112126572366314)
            throw "Error: exponentIsNonNanDouble1(2, 0) should be 21.112126572366314, was = " + result;
    }
    for (var i = 0; i < 10000; ++i) {
        var result = exponentIsNonNanDouble2(3, [-1.5]);
        if (result !== 0.19245008972987526)
            throw "Error: exponentIsNonNanDouble2(3, [-1.5]) should be 0.19245008972987526, was = " + result;
    }
}
testExponentIsDoubleConstant();
