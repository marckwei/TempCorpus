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

let now1 = 1592870440000;
let now2 = 1592827240000;

{
    let o = new Intl.DateTimeFormat("en" , {
        timeStyle: "short",
        timeZone: "UTC",
    });
    shouldBe(o.format(now1), `12:00 AM`);
}

{
    let o = new Intl.DateTimeFormat("en" , {
        timeStyle: "short",
        timeZone: "UTC",
        hourCycle: "h23",
    });
    shouldBe(o.format(now1), `00:00`);
}

{
    let o = new Intl.DateTimeFormat("en" , {
        timeStyle: "short",
        timeZone: "UTC",
        hourCycle: "h24",
    });
    shouldBe(o.format(now1), `24:00`);
}

{
    let o = new Intl.DateTimeFormat("en" , {
        timeStyle: "short",
        timeZone: "UTC",
        hourCycle: "h11",
    });
    shouldBe(o.format(now1), `0:00 AM`);
}

{
    let o = new Intl.DateTimeFormat("en" , {
        timeStyle: "short",
        timeZone: "UTC",
        hourCycle: "h12",
    });
    shouldBe(o.format(now1), `12:00 AM`);
}

{
    let o = new Intl.DateTimeFormat("en" , {
        timeStyle: "short",
        timeZone: "UTC",
        hour12: true,
    });
    shouldBe(o.format(now1), `12:00 AM`);
}

{
    let o = new Intl.DateTimeFormat("en" , {
        timeStyle: "short",
        timeZone: "UTC",
        hour12: false,
    });
    shouldBe(o.format(now1), `00:00`);
}

{
    let o = new Intl.DateTimeFormat("en" , {
        timeStyle: "short",
        timeZone: "UTC",
    });
    shouldBe(o.format(now2), `12:00 PM`);
}

{
    let o = new Intl.DateTimeFormat("en" , {
        timeStyle: "short",
        timeZone: "UTC",
        hourCycle: "h23",
    });
    shouldBe(o.format(now2), `12:00`);
}

{
    let o = new Intl.DateTimeFormat("en" , {
        timeStyle: "short",
        timeZone: "UTC",
        hourCycle: "h24",
    });
    shouldBe(o.format(now2), `12:00`);
}

{
    let o = new Intl.DateTimeFormat("en" , {
        timeStyle: "short",
        timeZone: "UTC",
        hourCycle: "h11",
    });
    shouldBe(o.format(now2), `0:00 PM`);
}

{
    let o = new Intl.DateTimeFormat("en" , {
        timeStyle: "short",
        timeZone: "UTC",
        hourCycle: "h12",
    });
    shouldBe(o.format(now2), `12:00 PM`);
}

{
    let o = new Intl.DateTimeFormat("en" , {
        timeStyle: "short",
        timeZone: "UTC",
        hour12: true,
    });
    shouldBe(o.format(now2), `12:00 PM`);
}

{
    let o = new Intl.DateTimeFormat("en" , {
        timeStyle: "short",
        timeZone: "UTC",
        hour12: false,
    });
    shouldBe(o.format(now2), `12:00`);
}
