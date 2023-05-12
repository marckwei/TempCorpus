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
    function Empty() {
    }
    let proxy = new Proxy(Empty, {});

    shouldBe(Reflect.construct(Intl.Collator, [], proxy) instanceof Empty, true);
    shouldBe(Reflect.construct(Intl.Collator, [], proxy).__proto__, Empty.prototype);

    shouldBe(Reflect.construct(Intl.NumberFormat, [], proxy) instanceof Empty, true);
    shouldBe(Reflect.construct(Intl.NumberFormat, [], proxy).__proto__, Empty.prototype);

    shouldBe(Reflect.construct(Intl.DateTimeFormat, [], proxy) instanceof Empty, true);
    shouldBe(Reflect.construct(Intl.DateTimeFormat, [], proxy).__proto__, Empty.prototype);
}

{
    function Empty() {
    }
    Empty.prototype = null;

    let proxy = new Proxy(Empty, {});

    shouldBe(Reflect.construct(Intl.Collator, [], proxy) instanceof Intl.Collator, true);
    shouldBe(Reflect.construct(Intl.Collator, [], proxy).__proto__, Intl.Collator.prototype);

    shouldBe(Reflect.construct(Intl.NumberFormat, [], proxy) instanceof Intl.NumberFormat, true);
    shouldBe(Reflect.construct(Intl.NumberFormat, [], proxy).__proto__, Intl.NumberFormat.prototype);

    shouldBe(Reflect.construct(Intl.DateTimeFormat, [], proxy) instanceof Intl.DateTimeFormat, true);
    shouldBe(Reflect.construct(Intl.DateTimeFormat, [], proxy).__proto__, Intl.DateTimeFormat.prototype);
}
