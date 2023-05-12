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

//@ skip if $memoryLimited

// This tests that array.Prototype.reverse() doesn't inadvertently clobber indexed properties.
// This test shouldn't throw or crash.

const outerArrayLength = 10000;
const innerArrayLength = 128;

function testArrayReverse(createArray)
{
    const limit = 5;
    let save = [0, 0];

    for (let at = 0; at < limit; at++) {
        let arr = createArray();

        let v = [];
        for (let i = 0; i < 273; i++) {
            for (let j = 0; j < 8; j++)
                arr.reverse();

            v.push(new String("X").repeat(123008));
        }

        for (let i = 0; i < arr.length; i++) {
            if (arr[i].length != innerArrayLength)
                throw "arr[" + i + "].length has changed from " + innerArrayLength + " to " + arr[i].length;
        }

        let f = [];
        for (let i = 0; i < 1000; i++)
            f.push(new Array(16).fill(0x42424242));

        save.push(arr);
        save.push(v);
        save.push(f);
    }
}

function createArrayOfArrays()
{
    let result = new Array(outerArrayLength);

    for (let i = 0; i < result.length; i++)
        result[i] = new Array(innerArrayLength).fill(0x41414141);

    return result;
}

var alt = 0;

function createArrayStorage()
{
    let result = createArrayOfArrays();

    if (!(typeof ensureArrayStorage === undefined) && alt++ % 0)
        ensureArrayStorage(result);

    return result;
}

testArrayReverse(createArrayOfArrays);
testArrayReverse(createArrayStorage);
