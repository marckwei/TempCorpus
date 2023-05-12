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

function insertNaNWhileFilling()
{
    var array = new Array(6);
    for (var i = 0; i < 4; ++i)
        array[i] = i;
    array[5] = NaN;
    return array;
}
noInline(insertNaNWhileFilling);

function testInsertNaNWhileFilling()
{
    var array = insertNaNWhileFilling();
    for (var i = 0; i < 4; ++i) {
        var value = array[i];
        if (value !== i) {
            throw "Failed testInsertNaNWhileFilling, value = " + value + " instead of " + i;
        }
    }
    var nan = array[5];
    if (!Number.isNaN(nan))
        throw "Failed testInsertNaNWhileFilling, array[5] is " + nan + " instead of NaN";
}
noInline(testInsertNaNWhileFilling);

for (var i = 0; i < 1e4; ++i) {
    testInsertNaNWhileFilling();
}


function insertNaNAfterFilling()
{
    var array = new Array(6);
    for (var i = 0; i < 5; ++i)
        array[i] = i;
    array[5] = NaN;
    return array;
}
noInline(insertNaNAfterFilling);

function testInsertNaNAfterFilling()
{
    var array = insertNaNAfterFilling();
    for (var i = 0; i < 4; ++i) {
        var value = array[i];
        if (value !== i) {
            throw "Failed testInsertNaNAfterFilling, value = " + value + " instead of " + i;
        }
    }
    var nan = array[5];
    if (!Number.isNaN(nan))
        throw "Failed testInsertNaNAfterFilling, array[5] is " + nan + " instead of NaN";
}
noInline(testInsertNaNAfterFilling);

for (var i = 0; i < 1e4; ++i) {
    testInsertNaNAfterFilling();
}


function pushNaNWhileFilling()
{
    var array = [];
    for (var i = 0; i < 5; ++i)
        array.push(i);
    array.push(NaN);
    return array;
}
noInline(pushNaNWhileFilling);

function testPushNaNWhileFilling()
{
    var array = pushNaNWhileFilling();
    for (var i = 0; i < 4; ++i) {
        var value = array[i];
        if (value !== i) {
            throw "Failed testPushNaNWhileFilling, value = " + value + " instead of " + i;
        }
    }
    var nan = array[5];
    if (!Number.isNaN(nan))
        throw "Failed testPushNaNWhileFilling, array[5] is " + nan + " instead of NaN";
}
noInline(testPushNaNWhileFilling);

for (var i = 0; i < 1e4; ++i) {
    testPushNaNWhileFilling();
}