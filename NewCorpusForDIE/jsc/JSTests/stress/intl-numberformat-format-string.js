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
shouldBe(nf.format("54.321"), `54.321`);
if (nf.formatRange) {
    shouldBe(nf.formatRange("-54.321", "+54.321"), `-54.321 – 54.321`);
    shouldBe(nf.formatRange("-54.321", "20000000000000000000000000000000000000000"), `-54.321 – 20,000,000,000,000,000,000,000,000,000,000,000,000,000`);
    shouldBe(nf.formatRange("-0", "0"), `-0 – 0`);
    shouldBe(nf.formatRange("-0", "1000000000000000000000000000000000000000000000"), `-0 – 1,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000`);
    shouldBe(nf2.formatRange("-54.321", "+54.321"), `-54.321 ～ 54.321`);
    shouldBe(nf2.formatRange("-54.321", "20000000000000000000000000000000000000000"), `-54.321 ～ 20,000,000,000,000,000,000,000,000,000,000,000,000,000`);
    shouldBe(nf2.formatRange("-0", "0"), `-0 ～ 0`);
    shouldBe(nf2.formatRange("-0", "1000000000000000000000000000000000000000000000"), `-0 ～ 1,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000`);
}
if (nf.formatRangeToParts) {
    shouldBe(JSON.stringify(nf.formatRangeToParts("-54.321", "+54.321")), `[{"type":"minusSign","value":"-","source":"startRange"},{"type":"integer","value":"54","source":"startRange"},{"type":"decimal","value":".","source":"startRange"},{"type":"fraction","value":"321","source":"startRange"},{"type":"literal","value":" – ","source":"shared"},{"type":"integer","value":"54","source":"endRange"},{"type":"decimal","value":".","source":"endRange"},{"type":"fraction","value":"321","source":"endRange"}]`);
    shouldBe(JSON.stringify(nf.formatRangeToParts("-54.321", "20000000000000000000000000000000000000000")), `[{"type":"minusSign","value":"-","source":"startRange"},{"type":"integer","value":"54","source":"startRange"},{"type":"decimal","value":".","source":"startRange"},{"type":"fraction","value":"321","source":"startRange"},{"type":"literal","value":" – ","source":"shared"},{"type":"integer","value":"20","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"}]`);
    shouldBe(JSON.stringify(nf.formatRangeToParts("-0", "0")), `[{"type":"minusSign","value":"-","source":"startRange"},{"type":"integer","value":"0","source":"startRange"},{"type":"literal","value":" – ","source":"shared"},{"type":"integer","value":"0","source":"endRange"}]`);
    shouldBe(JSON.stringify(nf.formatRangeToParts("-0", "1000000000000000000000000000000000000000000000")), `[{"type":"minusSign","value":"-","source":"startRange"},{"type":"integer","value":"0","source":"startRange"},{"type":"literal","value":" – ","source":"shared"},{"type":"integer","value":"1","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"}]`);
    shouldBe(JSON.stringify(nf2.formatRangeToParts("-54.321", "+54.321")), `[{"type":"minusSign","value":"-","source":"startRange"},{"type":"integer","value":"54","source":"startRange"},{"type":"decimal","value":".","source":"startRange"},{"type":"fraction","value":"321","source":"startRange"},{"type":"literal","value":" ～ ","source":"shared"},{"type":"integer","value":"54","source":"endRange"},{"type":"decimal","value":".","source":"endRange"},{"type":"fraction","value":"321","source":"endRange"}]`);
    shouldBe(JSON.stringify(nf2.formatRangeToParts("-54.321", "20000000000000000000000000000000000000000")), `[{"type":"minusSign","value":"-","source":"startRange"},{"type":"integer","value":"54","source":"startRange"},{"type":"decimal","value":".","source":"startRange"},{"type":"fraction","value":"321","source":"startRange"},{"type":"literal","value":" ～ ","source":"shared"},{"type":"integer","value":"20","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"}]`);
    shouldBe(JSON.stringify(nf2.formatRangeToParts("-0", "0")), `[{"type":"minusSign","value":"-","source":"startRange"},{"type":"integer","value":"0","source":"startRange"},{"type":"literal","value":" ～ ","source":"shared"},{"type":"integer","value":"0","source":"endRange"}]`);
    shouldBe(JSON.stringify(nf2.formatRangeToParts("-0", "1000000000000000000000000000000000000000000000")), `[{"type":"minusSign","value":"-","source":"startRange"},{"type":"integer","value":"0","source":"startRange"},{"type":"literal","value":" ～ ","source":"shared"},{"type":"integer","value":"1","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"},{"type":"group","value":",","source":"endRange"},{"type":"integer","value":"000","source":"endRange"}]`);
}
