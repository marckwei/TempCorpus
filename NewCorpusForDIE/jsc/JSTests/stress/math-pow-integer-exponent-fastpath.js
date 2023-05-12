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

function valuesAreClose(a, b) {
    return Math.abs(a / b) - 1 < 1e-10;
}

// Small exponent values are handled through a simpler inline loop. Test that it is not observable.
function mathPowDoubleDoubleTestExponentFifty(x, y) {
    return Math.pow(x, y)
}
noInline(mathPowDoubleDoubleTestExponentFifty);

function mathPowDoubleIntTestExponentFifty(x, y) {
    return Math.pow(x, y)
}
noInline(mathPowDoubleIntTestExponentFifty);
function testExponentFifty(x, y, expected) {
    for (var i = 0; i < 10000; ++i) {
        var result = mathPowDoubleDoubleTestExponentFifty(x, y);
        if (!valuesAreClose(result, expected))
            throw "Error: bad result, Math.pow(" + x + ", " + y + ") = " + result + " expected value close to " + expected;
    }
    var integerY = y | 0;
    for (var i = 0; i < 10000; ++i) {
        var result = mathPowDoubleIntTestExponentFifty(x, integerY);
        if (!valuesAreClose(result, expected))
            throw "Error: bad result, Math.pow(" + x + ", " + integerY + ") = " + result + " expected value close to " + expected;
    }
}
noInline(testExponentFifty);
testExponentFifty(53.70901164133102, 50.0, 3.179494118120144e+86);
testExponentFifty(53.70901164133102, -10.0, 5.006432842621192e-18);

function mathPowDoubleDoubleTestExponentTenThousands(x, y) {
    return Math.pow(x, y)
}
noInline(mathPowDoubleDoubleTestExponentTenThousands);

function mathPowDoubleIntTestExponentTenThousands(x, y) {
    return Math.pow(x, y)
}
noInline(mathPowDoubleIntTestExponentTenThousands);
function testExponentTenThousands(x, y, expected) {
    for (var i = 0; i < 10000; ++i) {
        var result = mathPowDoubleDoubleTestExponentTenThousands(x, y);
        if (!valuesAreClose(result, expected))
            throw "Error: bad result, Math.pow(" + x + ", " + y + ") = " + result + " expected value close to " + expected;
    }
    var integerY = y | 0;
    for (var i = 0; i < 10000; ++i) {
        var result = mathPowDoubleIntTestExponentTenThousands(x, integerY);
        if (!valuesAreClose(result, expected))
            throw "Error: bad result, Math.pow(" + x + ", " + integerY + ") = " + result + " expected value close to " + expected;
    }
}
noInline(testExponentTenThousands);
testExponentTenThousands(1.001, 10000.0, 21916.681339048373);
testExponentTenThousands(1.001, -1.0, 0.9990009990009991);