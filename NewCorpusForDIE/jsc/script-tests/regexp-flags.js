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

description('Test RegExp#flags accessor');

debug("property descriptor");
var descriptor = Object.getOwnPropertyDescriptor(RegExp.prototype, 'flags');
shouldBe("descriptor.configurable", "true");
shouldBe("descriptor.enumerable", "false");
shouldBe("typeof descriptor.get", "'function'");
shouldBe("descriptor.set", "undefined");

var flags = descriptor.get;

shouldBe("/a/g.flags", "'g'");
shouldBe("/a/.flags", "''");
shouldBe("/a/gmi.flags", "'gim'"); // order is specified, happens to be alphabetic
shouldBe("new RegExp('a', 'gmi').flags", "'gim'");
shouldBe("flags.call(/a/ig)", "'gi'");

debug("non-object receivers");
shouldThrow("flags.call(undefined)", "'TypeError: The RegExp.prototype.flags getter can only be called on an object'");
shouldThrow("flags.call(null)", "'TypeError: The RegExp.prototype.flags getter can only be called on an object'");
shouldThrow("flags.call(false)", "'TypeError: The RegExp.prototype.flags getter can only be called on an object'");
shouldThrow("flags.call(true)", "'TypeError: The RegExp.prototype.flags getter can only be called on an object'");

debug("non-regex objects");
shouldBe("flags.call({})", "''");
shouldBe("flags.call({global: true, multiline: true, ignoreCase: true})", "'gim'");
shouldBe("flags.call({global: 1, multiline: 0, ignoreCase: 2})", "'gi'");
// inherited properties count
shouldBe("flags.call({ __proto__: { multiline: true } })", "'m'");

debug("unicode flag");
shouldBe("/a/uimg.flags", "'gimu'");
shouldBe("new RegExp('a', 'uimg').flags", "'gimu'");
shouldBe("flags.call({global: true, multiline: true, ignoreCase: true, unicode: true})", "'gimu'");

debug("sticky flag");
shouldBe("/a/yimg.flags", "'gimy'");
shouldBe("new RegExp('a', 'yimg').flags", "'gimy'");
shouldBe("flags.call({global: true, multiline: true, ignoreCase: true, sticky: true})", "'gimy'");
