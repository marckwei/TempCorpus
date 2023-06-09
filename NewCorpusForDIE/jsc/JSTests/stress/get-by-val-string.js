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

var object = {};
object[42] = 42;
object[43] = function tag() { return 42; };

shouldBe(object['43']`Hello`, 42);


class Hello {
    constructor()
    {
        this['44'] = 42;
        shouldBe(this['42'], 42);
        shouldBe(this['43'](), 42);
        shouldBe(this['44'], 42);
    }

    get 42()
    {
        return 42;
    }

    43()
    {
        return 42;
    }
}

class Derived extends Hello {
    constructor()
    {
        super();
        shouldBe(super['42'], 42);
        shouldBe(super['43'](), 42);
        shouldBe(this['44']++, 42);
        shouldBe(++this['44'], 44);
    }
}

var derived = new Derived();

var test = { 42: '' };

for (test['42'] in { a: 'a' })
    shouldBe(test['42'], 'a');
shouldBe(test['42'], 'a');

for (test['42'] of [ 'b' ])
    shouldBe(test['42'], 'b');
shouldBe(test['42'], 'b');

{
    let { '42': a } = { '42': '42' };
    shouldBe(a, '42');
}

{
    let object = { 42: 42 };
    let objectAlias = object;
    object['42'] = (object = 30);
    shouldBe(objectAlias['42'], 30);
}
