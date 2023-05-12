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
    if (Number.isNaN(actual) || actual !== expected)
        throw new Error('bad value: ' + actual);
}

function parsedDate(string) {
    return Date.parse(string);
}

shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+0`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-0`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+000`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-000`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+00000`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-00000`)), true);

shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+:00`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-:00`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+0:00`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-0:00`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+000:00`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-000:00`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+0000:00`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-0000:00`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+00000:00`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-00000:00`)), true);

shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+00:`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-00:`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+00:0`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-00:0`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+00:000`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-00:000`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+00:0000`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-00:0000`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+00:00000`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-00:00000`)), true);

shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+25`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-25`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+2500`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-2500`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+0080`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-0080`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+0060`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-0060`)), true);

shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+24A`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-24A`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+2400A`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-2400A`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+0080A`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-0080A`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+0059A`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-0059A`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+24:00A`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-24:00A`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+00:80A`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-00:80A`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+00:59A`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-00:59A`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+24:00:`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-24:00:`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+00:80:`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-00:80:`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+00:59:`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-00:59:`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+24:00:00`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-24:00:00`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+00:80:00`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-00:80:00`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+00:59:00`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-00:59:00`)), true);

shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000++2`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-+2`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000++200`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-+200`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000+00:0+`)), true);
shouldBe(Number.isNaN(parsedDate(`1970-01-01T00:00:00.000-00:0+`)), true);

shouldBe(parsedDate(`1970-01-01T00:00:00.000+00`), 0);
shouldBe(parsedDate(`1970-01-01T00:00:00.000-00`), 0);
shouldBe(parsedDate(`1970-01-01T00:00:00.000+0000`), 0);
shouldBe(parsedDate(`1970-01-01T00:00:00.000-0000`), 0);
shouldBe(parsedDate(`1970-01-01T00:00:00.000+0030`), -(60 * 30 * 1000));
shouldBe(parsedDate(`1970-01-01T00:00:00.000-0030`), +(60 * 30 * 1000));
shouldBe(parsedDate(`1970-01-01T00:00:00.000+0130`), -(60 * (30 + 60) * 1000));
shouldBe(parsedDate(`1970-01-01T00:00:00.000-0130`), +(60 * (30 + 60) * 1000));

shouldBe(parsedDate(`1970-01-01T00:00:00.000+24:59`), -((24 * 60 + 59) * 60 * 1000));
shouldBe(parsedDate(`1970-01-01T00:00:00.000-24:59`), +((24 * 60 + 59) * 60 * 1000));
shouldBe(parsedDate(`1970-01-01T00:00:00.000+2459`), -((24 * 60 + 59) * 60 * 1000));
shouldBe(parsedDate(`1970-01-01T00:00:00.000-2459`), +((24 * 60 + 59) * 60 * 1000));
