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
    var resultA = Math.ceil(a);
    var resultB = Math.ceil(a)|0;
    return { resultA:resultA, resultB:resultB };
}
noInline(firstCareAboutZeroSecondDoesNot);

function firstDoNotCareAboutZeroSecondDoes(a) {
    var resultA = Math.ceil(a)|0;
    var resultB = Math.ceil(a);
    return { resultA:resultA, resultB:resultB };
}
noInline(firstDoNotCareAboutZeroSecondDoes);

// Warmup with doubles, but nothing that would ceil to -0 to ensure we never
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
            throw new Error("Failed firstCareAboutZeroSecondDoesNot(-0.1), resultA = " + result1.resultA);
        }
        if (1 / result1.resultB !== Infinity) {
            throw new Error("Failed firstCareAboutZeroSecondDoesNot(-0.1), resultB = " + result1.resultB);
        }
        var result2 = firstDoNotCareAboutZeroSecondDoes(-0.1);
        if (1 / result2.resultA !== Infinity) {
            throw new Error("Failed firstDoNotCareAboutZeroSecondDoes(-0.1), resultA = " + result1.resultA);
        }
        if (1 / result2.resultB !== -Infinity) {
            throw new Error("Failed firstDoNotCareAboutZeroSecondDoes(-0.1), resultB = " + result1.resultB);
        }
        var result3 = firstCareAboutZeroSecondDoesNot(-0.0);
        if (1 / result3.resultA !== -Infinity) {
            throw new Error("Failed firstCareAboutZeroSecondDoesNot(-0.0), resultA = " + result3.resultA);
        }
        if (1 / result3.resultB !== Infinity) {
            throw new Error("Failed firstCareAboutZeroSecondDoesNot(-0.0), resultB = " + result3.resultB);
        }
        var result4 = firstDoNotCareAboutZeroSecondDoes(-0.0);
        if (1 / result4.resultA !== Infinity) {
            throw new Error("Failed firstDoNotCareAboutZeroSecondDoes(-0.0), resultA = " + result4.resultA);
        }
        if (1 / result4.resultB !== -Infinity) {
            throw new Error("Failed firstDoNotCareAboutZeroSecondDoes(-0.0), resultB = " + result4.resultB);
        }
        var result5 = firstCareAboutZeroSecondDoesNot(0.0);
        if (1 / result5.resultA !== Infinity) {
            throw new Error("Failed firstCareAboutZeroSecondDoesNot(0.0), resultA = " + result5.resultA);
        }
        if (1 / result5.resultB !== Infinity) {
            throw new Error("Failed firstCareAboutZeroSecondDoesNot(0.0), resultB = " + result5.resultB);
        }
        var result6 = firstDoNotCareAboutZeroSecondDoes(0.0);
        if (1 / result6.resultA !== Infinity) {
            throw new Error("Failed firstDoNotCareAboutZeroSecondDoes(0.0), resultA = " + result6.resultA);
        }
        if (1 / result6.resultB !== Infinity) {
            throw new Error("Failed firstDoNotCareAboutZeroSecondDoes(0.0), resultB = " + result6.resultB);
        }
        var result7 = firstCareAboutZeroSecondDoesNot(0.1);
        if (1 / result7.resultA !== 1) {
            throw new Error("Failed firstCareAboutZeroSecondDoesNot(0.1), resultA = " + result7.resultA);
        }
        if (1 / result7.resultB !== 1) {
            throw new Error("Failed firstCareAboutZeroSecondDoesNot(0.1), resultB = " + result7.resultB);
        }
        var result8 = firstDoNotCareAboutZeroSecondDoes(0.1);
        if (1 / result8.resultA !== 1) {
            throw new Error("Failed firstDoNotCareAboutZeroSecondDoes(0.1), resultA = " + result8.resultA);
        }
        if (1 / result8.resultB !== 1) {
            throw new Error("Failed firstDoNotCareAboutZeroSecondDoes(0.1), resultB = " + result8.resultB);
        }
    }
}
verifyNegativeZeroIsPreserved();
