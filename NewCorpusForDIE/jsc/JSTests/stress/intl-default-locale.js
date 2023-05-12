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

// Actual default should always be a string
shouldBe(typeof new Intl.DateTimeFormat().resolvedOptions().locale, 'string');
shouldBe(typeof new Intl.NumberFormat().resolvedOptions().locale, 'string');
shouldBe(typeof new Intl.Collator().resolvedOptions().locale, 'string');

// Actual default should always be canonicalized
shouldBe(Intl.getCanonicalLocales(new Intl.DateTimeFormat().resolvedOptions().locale)[0], new Intl.DateTimeFormat().resolvedOptions().locale);
shouldBe(Intl.getCanonicalLocales(new Intl.NumberFormat().resolvedOptions().locale)[0], new Intl.NumberFormat().resolvedOptions().locale);
shouldBe(Intl.getCanonicalLocales(new Intl.Collator().resolvedOptions().locale)[0], new Intl.NumberFormat().resolvedOptions().locale);

$vm.setUserPreferredLanguages([ "fr-FR" ]);
shouldBe(new Intl.DateTimeFormat().resolvedOptions().locale, 'fr-FR');
shouldBe(new Intl.NumberFormat().resolvedOptions().locale, 'fr-FR');
shouldBe(new Intl.Collator().resolvedOptions().locale, 'fr-FR');
