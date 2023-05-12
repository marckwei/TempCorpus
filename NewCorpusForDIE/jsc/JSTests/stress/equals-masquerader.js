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

function equalsNull(o) {
    return o == null;
}

noInline(equalsNull);

function notEqualsNull(o) {
    return o != null;
}

noInline(notEqualsNull);

function strictEqualsNull(o) {
    return o === null;
}

noInline(strictEqualsNull);

function strictNotEqualsNull(o) {
    return o !== null;
}

noInline(strictNotEqualsNull);

function equalsUndefined(o) {
    return o == void 0;
}

noInline(equalsUndefined);

function notEqualsUndefined(o) {
    return o != void 0;
}

noInline(notEqualsUndefined);

function strictEqualsUndefined(o) {
    return o === void 0;
}

noInline(strictEqualsUndefined);

function strictNotEqualsUndefined(o) {
    return o !== void 0;
}

noInline(strictNotEqualsNull);

function isFalsey(o) {
    return !o;
}

noInline(isFalsey);

function test(func, iteration, object, outcome) {
    var result = func(object);
    if (result != outcome)
        throw new Error("Bad result: " + result + " on iteration " + iteration);
}

for (var i = 0; i < 10000; ++i) {
    test(equalsNull, i, null, true);
    test(equalsNull, i, undefined, true);
    test(equalsNull, i, void 0, true);
    test(equalsNull, i, {}, false);
    test(equalsNull, i, makeMasquerader(), true);
}

for (var i = 0; i < 10000; ++i) {
    test(notEqualsNull, i, null, false);
    test(notEqualsNull, i, undefined, false);
    test(notEqualsNull, i, void 0, false);
    test(notEqualsNull, i, {}, true);
    test(notEqualsNull, i, makeMasquerader(), false);
}

for (var i = 0; i < 10000; ++i) {
    test(strictEqualsNull, i, null, true);
    test(strictEqualsNull, i, undefined, false);
    test(strictEqualsNull, i, void 0, false);
    test(strictEqualsNull, i, {}, false);
    test(strictEqualsNull, i, makeMasquerader(), false);
}

for (var i = 0; i < 10000; ++i) {
    test(strictNotEqualsNull, i, null, false);
    test(strictNotEqualsNull, i, undefined, true);
    test(strictNotEqualsNull, i, void 0, true);
    test(strictNotEqualsNull, i, {}, true);
    test(strictNotEqualsNull, i, makeMasquerader(), true);
}

for (var i = 0; i < 10000; ++i) {
    test(equalsUndefined, i, null, true);
    test(equalsUndefined, i, undefined, true);
    test(equalsUndefined, i, void 0, true);
    test(equalsUndefined, i, {}, false);
    test(equalsUndefined, i, makeMasquerader(), true);
}

for (var i = 0; i < 10000; ++i) {
    test(notEqualsUndefined, i, null, false);
    test(notEqualsUndefined, i, undefined, false);
    test(notEqualsUndefined, i, void 0, false);
    test(notEqualsUndefined, i, {}, true);
    test(notEqualsUndefined, i, makeMasquerader(), false);
}

for (var i = 0; i < 10000; ++i) {
    test(strictEqualsUndefined, i, null, false);
    test(strictEqualsUndefined, i, undefined, true);
    test(strictEqualsUndefined, i, void 0, true);
    test(strictEqualsUndefined, i, {}, false);
    test(strictEqualsUndefined, i, makeMasquerader(), false);
}

for (var i = 0; i < 10000; ++i) {
    test(strictNotEqualsUndefined, i, null, true);
    test(strictNotEqualsUndefined, i, undefined, false);
    test(strictNotEqualsUndefined, i, void 0, false);
    test(strictNotEqualsUndefined, i, {}, true);
    test(strictNotEqualsUndefined, i, makeMasquerader(), true);
}

for (var i = 0; i < 10000; ++i) {
    test(isFalsey, i, null, true);
    test(isFalsey, i, undefined, true);
    test(isFalsey, i, void 0, true);
    test(isFalsey, i, {}, false);
    test(isFalsey, i, makeMasquerader(), true);
}
