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

function negativeRange(results)
{
    for (var i = -1; i > -10; --i) {
        results[Math.abs(i)] = i;
    }
}
noInline(negativeRange);

for (var i = 0; i < 1e4; ++i) {
    var results = [];
    negativeRange(results);
    if (results.length != 10)
        throw "Wrong result length: " + results.length;
    for (var j = 0; j < 10; ++j) {
        if (j < 1) {
            if (results[j] !== undefined)
                throw "Wrong result, results[j] = " + results[j] + " at j = " + j;
            continue;
        }
        if (results[j] !== -j)
            throw "Wrong result, results[j] = " + results[j] + " at j = " + j;
    }
}

function negativeRangeIncludingZero(results)
{
    for (var i = 0; i > -10; --i) {
        results[Math.abs(i)] = i;
    }
}
noInline(negativeRangeIncludingZero);

for (var i = 0; i < 1e4; ++i) {
    var results = [];
    negativeRangeIncludingZero(results);
    if (results.length != 10)
        throw "Wrong result length: " + results.length;
    for (var j = 0; j < 10; ++j) {
        if (results[j] !== -j)
            throw "Wrong result, results[j] = " + results[j] + " at j = " + j;
    }
}

function negativeRangeWithOverflow(results, limit)
{
    var i = -2147483648 + 10;
    do {
        results.push(Math.abs(i));
        --i;
    } while (i !== limit);
}
noInline(negativeRangeWithOverflow);

// First, we warm up without overflow.
for (var i = 0; i < 1e4; ++i) {
    var results = [];
    negativeRangeWithOverflow(results, -2147483647);
    if (results.length != 9)
        throw "Wrong result length: " + results.length;
    for (var j = 0; j < 9; ++j) {
        if (results[j] !== 2147483638 + j)
            throw "Wrong result, results[j] = " + results[j] + " at j = " + j;
    }
}

// Then we overflow.
for (var i = 0; i < 1e4; ++i) {
    var results = [];
    negativeRangeWithOverflow(results, -2147483648);
    if (results.length != 10)
        throw "Wrong result length: " + results.length;
    for (var j = 0; j < 10; ++j) {
        if (results[j] !== 2147483638 + j)
            throw "Wrong result, results[j] = " + results[j] + " at j = " + j;
    }
}

function positiveRange(results)
{
    for (var i = 1; i < 10; ++i) {
        results[Math.abs(i)] = i;
    }
}
noInline(positiveRange);

for (var i = 0; i < 1e4; ++i) {
    var results = [];
    positiveRange(results);
    if (results.length != 10)
        throw "Wrong result length: " + results.length;
    for (var j = 0; j < 10; ++j) {
        if (j < 1) {
            if (results[j] !== undefined)
                throw "Wrong result, results[j] = " + results[j] + " at j = " + j;
            continue;
        }
        if (results[j] !== j)
            throw "Wrong result, results[j] = " + results[j] + " at j = " + j;
    }
}

function positiveRangeIncludingZero(results)
{
    for (var i = 0; i < 10; ++i) {
        results[Math.abs(i)] = i;
    }
}
noInline(positiveRangeIncludingZero);

for (var i = 0; i < 1e4; ++i) {
    var results = [];
    positiveRangeIncludingZero(results);
    if (results.length != 10)
        throw "Wrong result length: " + results.length;
    for (var j = 0; j < 10; ++j) {
        if (results[j] !== j)
            throw "Wrong result, results[j] = " + results[j] + " at j = " + j;
    }
}

function rangeWithoutOverflow(results)
{
    for (var i = -10; i < 10; ++i) {
        results[i] = Math.abs(i);
    }
}
noInline(rangeWithoutOverflow);

for (var i = 0; i < 1e4; ++i) {
    var results = [];
    rangeWithoutOverflow(results);
    if (results.length != 10)
        throw "Wrong result length: " + results.length;
    for (var j = -10; j < 10; ++j) {
        var expected = (j < 0) ? -j : j;
        if (results[j] !== expected)
            throw "Wrong result, results[j] = " + results[j] + " at j = " + j;
    }
}
