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

function firstCareAboutZeroSecondDoesNot(a) {
    var resultA = Math.round(a);
    var resultB = Math.round(a)|0;
    return { resultA:resultA, resultB:resultB };
}
noInline(firstCareAboutZeroSecondDoesNot);

function firstDoNotCareAboutZeroSecondDoes(a) {
    var resultA = Math.round(a)|0;
    var resultB = Math.round(a);
    return { resultA:resultA, resultB:resultB };
}
noInline(firstDoNotCareAboutZeroSecondDoes);

// Warmup with doubles, but nothing that would round to -0 to ensure we never
// see a double as result. The result must be integers, the input is kept to small values.
function warmup() {
    for (var i = 0; i < 1e4; ++i) {
        firstCareAboutZeroSecondDoesNot(42.6 + i);
        firstDoNotCareAboutZeroSecondDoes(42.4 + i);
    }
}
warmup();

function verifyNegativeZeroIsPreserved() {
    for (var i = 0; i < 1e4; ++i) {
        var result1 = firstCareAboutZeroSecondDoesNot(-0.1);
        if (1 / result1.resultA !== -Infinity) {
            throw "Failed firstCareAboutZeroSecondDoesNot(-0.1), resultA = " + result1.resultA;
        }
        if (1 / result1.resultB !== Infinity) {
            throw "Failed firstCareAboutZeroSecondDoesNot(-0.1), resultB = " + result1.resultB;
        }
        var result2 = firstDoNotCareAboutZeroSecondDoes(-0.1);
        if (1 / result2.resultA !== Infinity) {
            throw "Failed firstDoNotCareAboutZeroSecondDoes(-0.1), resultA = " + result1.resultA;
        }
        if (1 / result2.resultB !== -Infinity) {
            throw "Failed firstDoNotCareAboutZeroSecondDoes(-0.1), resultB = " + result1.resultB;
        }

    }
}
verifyNegativeZeroIsPreserved();