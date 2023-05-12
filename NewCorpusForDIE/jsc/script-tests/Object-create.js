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

description("Test to ensure correct behaviour of Object.defineProperties");

shouldThrow("Object.create()");
shouldThrow("Object.create('a string')");
shouldThrow("Object.create({}, 'a string')");
shouldThrow("Object.create(null, 'a string')");
shouldBe("JSON.stringify(Object.create(null,{property:{value:'foo', enumerable:true}, property2:{value:'foo', enumerable:true}}))", '\'{"property":"foo","property2":"foo"}\'');
shouldBe("JSON.stringify(Object.create({},{property:{value:'foo', enumerable:true}, property2:{value:'foo', enumerable:true}}))", '\'{"property":"foo","property2":"foo"}\'');
shouldBe("JSON.stringify(Object.create({},{property:{value:'foo'}, property2:{value:'foo', enumerable:true}}))", '\'{"property2":"foo"}\'');
shouldBe("JSON.stringify(Object.create(null,{property:{value:'foo'}, property2:{value:'foo', enumerable:true}}))", '\'{"property2":"foo"}\'');
shouldBe("Object.getPrototypeOf(Object.create(Array.prototype))", "Array.prototype");
shouldBe("Object.getPrototypeOf(Object.create(null))", "null");
function valueGet() { return true; }
var DescriptorWithValueGetter = { foo: Object.create(null, { value: { get: valueGet }})};
var DescriptorWithEnumerableGetter = { foo: Object.create(null, { value: {value: true}, enumerable: { get: valueGet }})};
var DescriptorWithConfigurableGetter = { foo: Object.create(null, { value: {value: true}, configurable: { get: valueGet }})};
var DescriptorWithWritableGetter = { foo: Object.create(null, { value: {value: true}, writable: { get: valueGet }})};
var DescriptorWithGetGetter = { foo: Object.create(null, { get: { get: function() { return valueGet } }})};
var DescriptorWithSetGetter = { foo: Object.create(null, { get: { value: valueGet}, set: { get: function(){ return valueGet; } }})};
shouldBeTrue("Object.create(null, DescriptorWithValueGetter).foo");
shouldBeTrue("Object.create(null, DescriptorWithEnumerableGetter).foo");
shouldBeTrue("Object.create(null, DescriptorWithConfigurableGetter).foo");
shouldBeTrue("Object.create(null, DescriptorWithWritableGetter).foo");
shouldBeTrue("Object.create(null, DescriptorWithGetGetter).foo");
shouldBeTrue("Object.create(null, DescriptorWithSetGetter).foo");
