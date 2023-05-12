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

function shouldNotThrow(func) {
  func();
}

function shouldThrow(func, errorType) {
    let error;
    try {
        func();
    } catch (e) {
        error = e;
    }

    if (!(error instanceof errorType))
        throw new Error(`Expected ${errorType.name}!`);
}

shouldBe(Number.prototype.toLocaleString.length, 0);
shouldBe(Object.getOwnPropertyDescriptor(Number.prototype, 'toLocaleString').enumerable, false);
shouldBe(Object.getOwnPropertyDescriptor(Number.prototype, 'toLocaleString').configurable, true);
shouldBe(Object.getOwnPropertyDescriptor(Number.prototype, 'toLocaleString').writable, true);

// Test thisNumberValue abrupt completion.
shouldNotThrow(() => Number.prototype.toLocaleString.call(0));
shouldNotThrow(() => Number.prototype.toLocaleString.call(NaN));
shouldNotThrow(() => Number.prototype.toLocaleString.call(Infinity));
shouldNotThrow(() => Number.prototype.toLocaleString.call(new Number));
shouldThrow(() => Number.prototype.toLocaleString.call(), TypeError);
shouldThrow(() => Number.prototype.toLocaleString.call(undefined), TypeError);
shouldThrow(() => Number.prototype.toLocaleString.call(null), TypeError);
shouldThrow(() => Number.prototype.toLocaleString.call('1'), TypeError);
shouldThrow(() => Number.prototype.toLocaleString.call([]), TypeError);
shouldThrow(() => Number.prototype.toLocaleString.call(Symbol()), TypeError);

shouldBe((0).toLocaleString(), '0');
shouldBe(new Number(1).toLocaleString(), '1');

// Test for NumberFormat behavior.
shouldThrow(() => (0).toLocaleString('i'), RangeError);
shouldBe(Infinity.toLocaleString(), '∞');

// Test that locale parameter is passed through properly.
shouldBe((123456.789).toLocaleString('ar'), '١٢٣٬٤٥٦٫٧٨٩');
shouldBe((123456.789).toLocaleString('zh-Hans-CN-u-nu-hanidec'), '一二三,四五六.七八九');

// Test that options parameter is passed through properly.
shouldBe((123.456).toLocaleString('en', { maximumSignificantDigits: 3 }), '123');
