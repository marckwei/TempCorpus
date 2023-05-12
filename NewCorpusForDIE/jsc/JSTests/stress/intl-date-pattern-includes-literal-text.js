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
        throw new Error(`expected ${expected} but got ${actual}`);
}

shouldBe(new Intl.DateTimeFormat("fr", {hour: "numeric", hour12: false}).resolvedOptions().hour12, false);
shouldBe(new Intl.DateTimeFormat("fr", {hour: "numeric", hour12: false}).format(new Date(2021, 2, 3, 23)), `23 h`);

shouldBe(new Intl.DateTimeFormat("fr", {hour: "numeric", hourCycle: 'h24'}).format(new Date(2021, 2, 3, 23)), '23 h');
shouldBe(new Intl.DateTimeFormat("fr", {hour: "numeric", hourCycle: 'h23'}).format(new Date(2021, 2, 3, 23)), '23 h');

shouldBe(JSON.stringify(new Intl.Locale("fr", {hourCycle: 'h24'}).getHourCycles()), `["h24"]`);
shouldBe(JSON.stringify(new Intl.Locale("fr", {hourCycle: 'h23'}).getHourCycles()), `["h23"]`);
shouldBe(JSON.stringify(new Intl.Locale("fr").getHourCycles()), `["h23"]`);
