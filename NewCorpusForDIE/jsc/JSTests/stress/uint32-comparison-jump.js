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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

function above(a, trap) {
    let result = 0;
    for (let i = 0; (a >>> 0) > (i >>> 0); ++i) {
        result += i;
        if (i === trap)
            break;
    }
    return result;
}
noInline(above);

function aboveOrEqual(a, trap) {
    let result = 0;
    for (let i = 0; (a >>> 0) >= (i >>> 0); ++i) {
        result += i;
        if (i === trap)
            break;
    }
    return result;
}
noInline(aboveOrEqual);

function below(a, trap) {
    let result = 0;
    for (let i = 0; (i >>> 0) < (a >>> 0); ++i) {
        result += i;
        if (i === trap)
            break;
    }
    return result;
}
noInline(below);

function belowOrEqual(a, trap) {
    let result = 0;
    for (let i = 0; (i >>> 0) <= (a >>> 0); ++i) {
        result += i;
        if (i === trap)
            break;
    }
    return result;
}
noInline(belowOrEqual);

function notAbove(a, trap) {
    let result = 0;
    for (let i = 0; (a >>> 0) > (i >>> 0) && a; ++i) {
        result += i;
        if (i === trap)
            break;
    }
    return result;
}
noInline(notAbove);

function notAboveOrEqual(a, trap) {
    let result = 0;
    for (let i = 0; (a >>> 0) >= (i >>> 0) && a; ++i) {
        result += i;
        if (i === trap)
            break;
    }
    return result;
}
noInline(notAboveOrEqual);

function notBelow(a, trap) {
    let result = 0;
    for (let i = 0; (i >>> 0) < (a >>> 0) && a; ++i) {
        result += i;
        if (i === trap)
            break;
    }
    return result;
}
noInline(notBelow);

function notBelowOrEqual(a, trap) {
    let result = 0;
    for (let i = 0; (i >>> 0) <= (a >>> 0) && a; ++i) {
        result += i;
        if (i === trap)
            break;
    }
    return result;
}
noInline(notBelowOrEqual);

for (var i = 0; i < 1e2; ++i) {
    shouldBe(above(0, -1), 0);
    shouldBe(above(20000, -1), 199990000);
    shouldBe(above(-1, 10000), 50005000);
}

for (var i = 0; i < 1e2; ++i) {
    shouldBe(aboveOrEqual(0, -1), 0);
    shouldBe(aboveOrEqual(20000, -1), 200010000);
    shouldBe(aboveOrEqual(-1, 10000), 50005000);
}

for (var i = 0; i < 1e2; ++i) {
    shouldBe(below(0, -1), 0);
    shouldBe(below(20000, -1), 199990000);
    shouldBe(below(-1, 10000), 50005000);
}

for (var i = 0; i < 1e2; ++i) {
    shouldBe(belowOrEqual(0, -1), 0);
    shouldBe(belowOrEqual(20000, -1), 200010000);
    shouldBe(belowOrEqual(-1, 10000), 50005000);
}

for (var i = 0; i < 1e2; ++i) {
    shouldBe(notAbove(0, -1), 0);
    shouldBe(notAbove(20000, -1), 199990000);
    shouldBe(notAbove(-1, 10000), 50005000);
}

for (var i = 0; i < 1e2; ++i) {
    shouldBe(notAboveOrEqual(0, -1), 0);
    shouldBe(notAboveOrEqual(20000, -1), 200010000);
    shouldBe(notAboveOrEqual(-1, 10000), 50005000);
}

for (var i = 0; i < 1e2; ++i) {
    shouldBe(notBelow(0, -1), 0);
    shouldBe(notBelow(20000, -1), 199990000);
    shouldBe(notBelow(-1, 10000), 50005000);
}

for (var i = 0; i < 1e2; ++i) {
    shouldBe(notBelowOrEqual(0, -1), 0);
    shouldBe(notBelowOrEqual(20000, -1), 200010000);
    shouldBe(notBelowOrEqual(-1, 10000), 50005000);
}

