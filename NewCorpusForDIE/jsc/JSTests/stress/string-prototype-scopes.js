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

var error = null;
try {
    eval(`
    var charAt = String.prototype.charAt;
    charAt();
    `);
} catch (e) {
    error = e;
}
shouldBe(String(error), `TypeError: Type error`);

var error = null;
try {
    var charAt = String.prototype.charAt;
    charAt();
} catch (e) {
    error = e;
}
shouldBe(String(error), `TypeError: Type error`);

var error = null;
try {
    let charAt = String.prototype.charAt;
    charAt();
    function refer() { charAt; }
} catch (e) {
    error = e;
}
shouldBe(String(error), `TypeError: Type error`);

(function () {
    var error = null;
    var ok = 42;
    try {
        var charAt = String.prototype.charAt;
        charAt();
    } catch (e) {
        error = e;
    }

    function refer() { charAt; } // Refer the charAt variable.
    shouldBe(String(error), `TypeError: Type error`);
    return ok;
}());

var object = { __proto__: String.prototype, toString() { return "Cocoa"; } };
with (object) {
    shouldBe(charAt(0), `C`);
}
