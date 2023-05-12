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

// Thu Apr 28 2022 14:42:34 GMT-0700 (Pacific Daylight Time)
const date1 = new Date(1651182154000);
$vm.setUserPreferredLanguages(['de-DE']);
shouldBe(date1.toString(), 'Thu Apr 28 2022 23:42:34 GMT+0200 (Mitteleuropäische Sommerzeit)');
shouldBe(date1.toTimeString(), '23:42:34 GMT+0200 (Mitteleuropäische Sommerzeit)');

// Tue Jan 18 2022 13:42:34 GMT-0800 (Pacific Standard Time)
const date2 = new Date(1642542154000);
shouldBe(date2.toString(), 'Tue Jan 18 2022 22:42:34 GMT+0100 (Mitteleuropäische Normalzeit)');
shouldBe(date2.toTimeString(), '22:42:34 GMT+0100 (Mitteleuropäische Normalzeit)');
