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

function *generatorFunction() {
}
let generator = generatorFunction();

shouldBe(generator instanceof generatorFunction, true);
shouldBe(typeof generator.__proto__, 'object');
shouldBe(generator.__proto__, generatorFunction.prototype);

let GeneratorPrototype = generator.__proto__.__proto__;

let GeneratorFunctionPrototype = generatorFunction.__proto__;
let GeneratorFunction = generatorFunction.__proto__.constructor;
shouldBe(GeneratorFunction.prototype, GeneratorFunctionPrototype);
shouldBe(generatorFunction instanceof GeneratorFunction, true);
shouldBe(GeneratorFunction.__proto__, Function);
shouldBe(GeneratorFunctionPrototype.__proto__, Function.prototype);

shouldBe(GeneratorFunctionPrototype.prototype, GeneratorPrototype);
shouldBe(GeneratorPrototype.constructor, GeneratorFunctionPrototype);

let arrayIterator = [][Symbol.iterator]();
let ArrayIteratorPrototype = arrayIterator.__proto__;
let IteratorPrototype = ArrayIteratorPrototype.__proto__;

shouldBe(IteratorPrototype, GeneratorPrototype.__proto__);
