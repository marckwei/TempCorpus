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

var allowDoubleShape = $vm.allowDoubleShape();

function testInt32()
{
    var array = [0, 1, 2, 3];
    var slice = array.slice(1);
    shouldBe($vm.indexingMode(array), "CopyOnWriteArrayWithInt32");
    shouldBe($vm.indexingMode(slice), "ArrayWithInt32");
    return slice;
}
noInline(testInt32);

function testDouble()
{
    var array = [0.1, 1.1, 2.1, 3.1];
    var slice = array.slice(1);
    if (allowDoubleShape) {
        shouldBe($vm.indexingMode(array), "CopyOnWriteArrayWithDouble");
        shouldBe($vm.indexingMode(slice), "ArrayWithDouble");
    } else {
        shouldBe($vm.indexingMode(array), "CopyOnWriteArrayWithContiguous");
        shouldBe($vm.indexingMode(slice), "ArrayWithContiguous");
    }
    return slice;
}
noInline(testDouble);

function testContiguous()
{
    var array = [true, false, true, false];
    var slice = array.slice(1);
    shouldBe($vm.indexingMode(array), "CopyOnWriteArrayWithContiguous");
    shouldBe($vm.indexingMode(slice), "ArrayWithContiguous");
    return slice;
}
noInline(testContiguous);

for (var i = 0; i < 1e4; ++i) {
    shouldBe(JSON.stringify(testInt32()), `[1,2,3]`);
    shouldBe(JSON.stringify(testDouble()), `[1.1,2.1,3.1]`);
    shouldBe(JSON.stringify(testContiguous()), `[false,true,false]`);
}
