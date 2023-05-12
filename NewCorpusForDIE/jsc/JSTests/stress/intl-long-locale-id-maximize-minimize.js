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
{
    const locale = new Intl.Locale(`de-Latn-DE-u-cu-eur-em-default-hc-h23-ks-level1-lb-strict-lw-normal-ms-metric-nu-latn-rg-atzzzz-sd-atat1-ss-none-tz-atvie-va-posix`);
    shouldBe(locale.minimize().toString(), `de-u-cu-eur-em-default-hc-h23-ks-level1-lb-strict-lw-normal-ms-metric-nu-latn-rg-atzzzz-sd-atat1-ss-none-tz-atvie-va-posix`);
}
{
    const locale = new Intl.Locale(`de-u-cu-eur-em-default-hc-h23-ks-level1-lb-strict-lw-normal-ms-metric-nu-latn-rg-atzzzz-sd-atat1-ss-none-tz-atvie-va-posix`);
    shouldBe(locale.maximize().toString(), `de-Latn-DE-u-cu-eur-em-default-hc-h23-ks-level1-lb-strict-lw-normal-ms-metric-nu-latn-rg-atzzzz-sd-atat1-ss-none-tz-atvie-va-posix`);
}
{
    const locale = new Intl.Locale(`de-variant0-rozaj-biske-nedis-variant1-variant2-variant3-variant4-variant5-variant6-variant7-variant8-variant9-varianta-variantb-variantc-variantd-variante-variantf-variantg-varianth-varianti-variantj-variantk`);
    const result = locale.maximize().toString();
    // "de-Latn-DE" is the right answer. But ICU has a bug and produce "de". The latest AppleICU has a fix and generate "de-Latn-DE".
    shouldBe(result === `de-Latn-DE` || result === `de`, true);
}
{
    const locale = new Intl.Locale(`de-Latn-DE-rozaj-biske-nedis-variant0-variant1-variant2-variant3-variant4-variant5-variant6-variant7-variant8-variant9-varianta-variantb-variantc-variantd-variante-variantf-variantg-varianth-varianti-variantj-variantk`);
    const result = locale.maximize().toString();
    // "de" is the right answer. But ICU has a bug and produce "de-Latn-DE". The latest AppleICU has a fix and generate "de".
    shouldBe(result === `de` || result === `de-Latn-DE`, true);
}
