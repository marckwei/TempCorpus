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

var custom = $vm.createCustomTestGetterSetter();
function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

var valueFunc = runString(`
var custom = $vm.createCustomTestGetterSetter();
function valueFunc() {
    return custom.customValueGlobalObject;
}`).valueFunc;

var accessorFunc = runString(`
var custom = $vm.createCustomTestGetterSetter();
function accessorFunc() {
    return custom.customAccessorGlobalObject;
}`).accessorFunc;

shouldBe(this.custom !== valueFunc().custom, true);
shouldBe(this.custom !== accessorFunc().custom, true);
shouldBe(this.custom, custom.customValueGlobalObject.custom);
shouldBe(this.custom, custom.customAccessorGlobalObject.custom);

function valueTest()
{
    return valueFunc();
}
noInline(valueTest);

function accessorTest()
{
    return accessorFunc();
}
noInline(accessorTest);

for (var i = 0; i < 1e3; ++i)
    shouldBe(this.custom !== valueTest().custom, true);
for (var i = 0; i < 1e3; ++i)
    shouldBe(this.custom !== accessorTest().custom, true);
