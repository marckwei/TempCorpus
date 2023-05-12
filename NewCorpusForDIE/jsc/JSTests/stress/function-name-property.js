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

shouldBe(({ f: () => {} }).f.name, 'f');
shouldBe(({ f: function () {} }).f.name, 'f');
shouldBe(({ ['f']: () => {} }).f.name, 'f');
shouldBe(({ ['f']: function () {} }).f.name, 'f');
shouldBe(({ async f() {} }).f.name, 'f');
shouldBe(({ async ['f']() {} }).f.name, 'f');
shouldBe((class { f() {} }).prototype.f.name, 'f');
shouldBe((class { ['f']() {} }).prototype.f.name, 'f');
shouldBe((class { async f() {} }).prototype.f.name, 'f');
shouldBe((class { async ['f']() {} }).prototype.f.name, 'f');

shouldBe([() => {}][0].name, '');
shouldBe([function () {}][0].name, '');
shouldBe(({ 0: () => {} })[0].name, '0');
shouldBe(({ 0: function () {} })[0].name, '0');
shouldBe(({ [0]: () => {} })[0].name, '0');
shouldBe(({ [0]: function () {} })[0].name, '0');
shouldBe((class { 0() {} }).prototype[0].name, '0');
shouldBe((class { [0]() {} }).prototype[0].name, '0');
