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
        throw new Error('bad value: ' + actual + " " + expected);
}

const nf = new Intl.NumberFormat("en-US");
const nf2 = new Intl.NumberFormat("ja-JP");
const start = 987654321987654321n;
const end = 987654321987654322n;
shouldBe(nf.format(start), `987,654,321,987,654,321`);
shouldBe(nf2.format(start), `987,654,321,987,654,321`);
if (nf.formatRange) {
    shouldBe(nf.formatRange(start, end), `987,654,321,987,654,321–987,654,321,987,654,322`);
    shouldBe(nf2.formatRange(start, end), `987,654,321,987,654,321～987,654,321,987,654,322`);
}
if (nf.formatRangeToParts) {
    shouldBe(JSON.stringify(nf.formatRangeToParts(0, 30000)), `[{"type":"integer","value":"0","source":"startRange"},{"type":"literal","value":"–","source":"shared"},{"type":"integer","value":"30","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"}]`);
    shouldBe(JSON.stringify(nf.formatRangeToParts(start, end)), `[{"type":"integer","value":"987","source":"startRange"},{"type":"group","value":",","source":"startRange"},{"type":"integer","value":"654","source":"startRange"},{"type":"group","value":",","source":"startRange"},{"type":"integer","value":"321","source":"startRange"},{"type":"group","value":",","source":"startRange"},{"type":"integer","value":"987","source":"startRange"},{"type":"group","value":",","source":"startRange"},{"type":"integer","value":"654","source":"startRange"},{"type":"group","value":",","source":"startRange"},{"type":"integer","value":"321","source":"startRange"},{"type":"literal","value":"–","source":"shared"},{"type":"integer","value":"987","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"654","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"321","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"987","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"654","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"322","source":"endRange"}]`);
    shouldBe(JSON.stringify(nf2.formatRangeToParts(start, end)), `[{"type":"integer","value":"987","source":"startRange"},{"type":"group","value":",","source":"startRange"},{"type":"integer","value":"654","source":"startRange"},{"type":"group","value":",","source":"startRange"},{"type":"integer","value":"321","source":"startRange"},{"type":"group","value":",","source":"startRange"},{"type":"integer","value":"987","source":"startRange"},{"type":"group","value":",","source":"startRange"},{"type":"integer","value":"654","source":"startRange"},{"type":"group","value":",","source":"startRange"},{"type":"integer","value":"321","source":"startRange"},{"type":"literal","value":"～","source":"shared"},{"type":"integer","value":"987","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"654","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"321","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"987","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"654","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"322","source":"endRange"}]`);
}
