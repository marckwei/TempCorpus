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

description('Test RegExp#toString');

shouldBe("Object.getOwnPropertyDescriptor(RegExp.prototype, 'toString').configurable", "true");
shouldBe("Object.getOwnPropertyDescriptor(RegExp.prototype, 'toString').enumerable", "false");
shouldBe("Object.getOwnPropertyDescriptor(RegExp.prototype, 'toString').get", "undefined");
shouldBe("Object.getOwnPropertyDescriptor(RegExp.prototype, 'toString').set", "undefined");
shouldBe("typeof Object.getOwnPropertyDescriptor(RegExp.prototype, 'toString').value", "'function'");

shouldBe("RegExp.prototype.toString.call(new RegExp)", "'/(?:)/'");
shouldBe("RegExp.prototype.toString.call(new RegExp('a'))", "'/a/'");
shouldBe("RegExp.prototype.toString.call(new RegExp('\\\\\\\\'))", "'/\\\\\\\\/'");

shouldBe("RegExp.prototype.toString.call({})", "'/undefined/undefined'");
shouldBe("RegExp.prototype.toString.call({source: 'hi'})", "'/hi/undefined'");
shouldBe("RegExp.prototype.toString.call({ __proto__: { source: 'yo' } })", "'/yo/undefined'");
shouldBe("RegExp.prototype.toString.call({source: ''})", "'//undefined'");
shouldBe("RegExp.prototype.toString.call({source: '/'})", "'///undefined'");

shouldThrow("RegExp.prototype.toString.call(undefined)");
shouldThrow("RegExp.prototype.toString.call(null)");
shouldThrow("RegExp.prototype.toString.call(false)");
shouldThrow("RegExp.prototype.toString.call(true)");
shouldThrow("RegExp.prototype.toString.call(0)");
shouldThrow("RegExp.prototype.toString.call(0.5)");
shouldThrow("RegExp.prototype.toString.call('x')");
