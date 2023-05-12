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

var array = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 0x80, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]);
var dataView = new DataView(array.buffer);

shouldBe(dataView.getBigInt64(0), 0x01020304050607n);
shouldBe(dataView.getBigUint64(0), 0x01020304050607n);
shouldBe(dataView.getBigInt64(8), -9223088349902469625n);
shouldBe(dataView.getBigUint64(8), 9223655723807081991n);

shouldBe(dataView.setBigInt64(0, -1n), undefined);
shouldBe(dataView.getBigInt64(0), -1n);
shouldBe(dataView.getBigUint64(0), 0xffffffffffffffffn);

shouldBe(dataView.setBigUint64(0, 0xfffffffffffffffen), undefined);
shouldBe(dataView.getBigInt64(0), -2n);
shouldBe(dataView.getBigUint64(0), 0xfffffffffffffffen);

shouldBe(dataView.setBigUint64(0, 0x1fffffffffffffffen), undefined);
shouldBe(dataView.getBigInt64(0), -2n);
shouldBe(dataView.getBigUint64(0), 0xfffffffffffffffen);
shouldBe(dataView.getUint8(0), 0xff);
