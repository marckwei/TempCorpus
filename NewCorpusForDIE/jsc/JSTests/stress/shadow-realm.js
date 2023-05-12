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

//@ requireOptions("--useShadowRealm=1")

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error(`expected ${expected} but got ${actual}`);
}

// shadow realm specs
{
    let shadowRealmProp = Object.getOwnPropertyDescriptor(this, "ShadowRealm");
    shouldBe(shadowRealmProp.enumerable, false);
    shouldBe(shadowRealmProp.writable, true);
    shouldBe(shadowRealmProp.configurable, true);

    let shadowRealmEvaluate = Object.getOwnPropertyDescriptor(ShadowRealm.prototype, "evaluate");
    shouldBe(shadowRealmEvaluate.enumerable, false);
    shouldBe(shadowRealmEvaluate.writable, true);
    shouldBe(shadowRealmEvaluate.configurable, true);

    let shadowRealmImportValue = Object.getOwnPropertyDescriptor(ShadowRealm.prototype, "importValue");
    shouldBe(shadowRealmImportValue.enumerable, false);
    shouldBe(shadowRealmImportValue.writable, true);
    shouldBe(shadowRealmImportValue.configurable, true);

    let shadowRealmName = Object.getOwnPropertyDescriptor(ShadowRealm, "name");
    shouldBe(shadowRealmName.value, "ShadowRealm");
    shouldBe(shadowRealmName.enumerable, false);
    shouldBe(shadowRealmName.writable, false);
    shouldBe(shadowRealmName.configurable, true);

    let shadowRealmLength = Object.getOwnPropertyDescriptor(ShadowRealm, "length");
    shouldBe(shadowRealmLength.value, 0);
    shouldBe(shadowRealmLength.enumerable, false);
    shouldBe(shadowRealmLength.writable, false);
    shouldBe(shadowRealmLength.configurable, true);
}
