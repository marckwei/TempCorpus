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
    let array = new Int8Array([]);
    shouldBe(array.sort(), array);
}
{
    let array = new Int16Array([]);
    shouldBe(array.sort(), array);
}
{
    let array = new Int32Array([]);
    shouldBe(array.sort(), array);
}
{
    let array = new Uint8Array([]);
    shouldBe(array.sort(), array);
}
{
    let array = new Uint16Array([]);
    shouldBe(array.sort(), array);
}
{
    let array = new Uint32Array([]);
    shouldBe(array.sort(), array);
}
{
    let array = new Uint8ClampedArray([]);
    shouldBe(array.sort(), array);
}
{
    let array = new Float32Array([]);
    shouldBe(array.sort(), array);
}
{
    let array = new Float64Array([]);
    shouldBe(array.sort(), array);
}
{
    let array = new BigInt64Array([]);
    shouldBe(array.sort(), array);
}
{
    let array = new BigUint64Array([]);
    shouldBe(array.sort(), array);
}
{
    let array = new Int8Array([1]);
    shouldBe(array.sort(), array);
}
{
    let array = new Int16Array([1]);
    shouldBe(array.sort(), array);
}
{
    let array = new Int32Array([1]);
    shouldBe(array.sort(), array);
}
{
    let array = new Uint8Array([1]);
    shouldBe(array.sort(), array);
}
{
    let array = new Uint16Array([1]);
    shouldBe(array.sort(), array);
}
{
    let array = new Uint32Array([1]);
    shouldBe(array.sort(), array);
}
{
    let array = new Uint8ClampedArray([1]);
    shouldBe(array.sort(), array);
}
{
    let array = new Float32Array([1]);
    shouldBe(array.sort(), array);
}
{
    let array = new Float64Array([1]);
    shouldBe(array.sort(), array);
}
{
    let array = new BigInt64Array([1n]);
    shouldBe(array.sort(), array);
}
{
    let array = new BigUint64Array([1n]);
    shouldBe(array.sort(), array);
}
{
    let array = new Int8Array([1, 2]);
    shouldBe(array.sort(), array);
}
{
    let array = new Int16Array([1, 2]);
    shouldBe(array.sort(), array);
}
{
    let array = new Int32Array([1, 2]);
    shouldBe(array.sort(), array);
}
{
    let array = new Uint8Array([1, 2]);
    shouldBe(array.sort(), array);
}
{
    let array = new Uint16Array([1, 2]);
    shouldBe(array.sort(), array);
}
{
    let array = new Uint32Array([1, 2]);
    shouldBe(array.sort(), array);
}
{
    let array = new Uint8ClampedArray([1, 2]);
    shouldBe(array.sort(), array);
}
{
    let array = new Float32Array([1, 2]);
    shouldBe(array.sort(), array);
}
{
    let array = new Float64Array([1, 2]);
    shouldBe(array.sort(), array);
}
{
    let array = new BigInt64Array([1n, 2n]);
    shouldBe(array.sort(), array);
}
{
    let array = new BigUint64Array([1n, 2n]);
    shouldBe(array.sort(), array);
}

