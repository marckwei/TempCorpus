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

if ($vm.icuVersion() >= 64 && $vm.icuHeaderVersion() >= 64) {
    shouldBe((299792458).toLocaleString("ja-JP", {
        style: "unit",
        unit: "meter-per-second",
        unitDisplay: "short"
    }), `299,792,458 m/s`);

    shouldBe((987654321).toLocaleString("ja-JP", {
        notation: "scientific"
    }), `9.877E8`);

    shouldBe((987654321).toLocaleString("ja-JP", {
        notation: "engineering"
    }), `987.654E6`);

    shouldBe((987654321).toLocaleString("ja-JP", {
        notation: "compact",
        compactDisplay: "long"
    }), `9.9億`);

    shouldBe((299792458).toLocaleString("ja-JP", {
        notation: "scientific",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        style: "unit",
        unit: "meter-per-second"
    }), `3.00E8 m/s`);

    shouldBe((55).toLocaleString("ja-JP", {
        signDisplay: "always"
    }), `+55`);

    shouldBe((-100).toLocaleString("ja-JP", {
        style: "currency",
        currency: "EUR",
        currencySign: "accounting"
    }), `(€100.00)`);

    shouldBe((0.55).toLocaleString("ja-JP", {
        style: "percent",
        signDisplay: "exceptZero"
    }), `+55%`);

    shouldBe((100).toLocaleString("ja-JP", {
        style: "currency",
        currency: "JPY",
        currencyDisplay: "narrowSymbol"
    }), `￥100`);
}
