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

function shouldThrow(func, errorMessage) {
    var errorThrown = false;
    var error = null;
    try {
        func();
    } catch (e) {
        errorThrown = true;
        error = e;
    }
    if (!errorThrown)
        throw new Error('not thrown');
    if (String(error) !== errorMessage)
        throw new Error(`bad error: ${String(error)}`);
}

function test1(view) {
    return view[1023];
}
noInline(test1);

{
    var arrayView1 = new Int8Array(1024);
    arrayView1[1023] = 42;
    for (var i = 0; i < 1e4; ++i)
        shouldBe(test1(arrayView1), 42);
    arrayView1[1023] = 41;
    shouldBe(test1(arrayView1), 41);

    var arrayView2 = new Int8Array(new ArrayBuffer(1024, { maxByteLength: 1024 }));
    arrayView2[1023] = 42;
    shouldBe(test1(arrayView2), 42);
    arrayView2.buffer.resize(0);
    shouldBe(test1(arrayView2), undefined);
    arrayView2.buffer.resize(1024);
    shouldBe(test1(arrayView2), 0);

    for (var i = 0; i < 1e4; ++i)
        shouldBe(test1(arrayView2), 0);
    shouldBe(test1(arrayView1), 41);
}

function test2(view) {
    return view[1023];
}
noInline(test2);

{
    var arrayView1 = new Int8Array(1024);
    arrayView1[1023] = 42;
    for (var i = 0; i < 1e4; ++i)
        shouldBe(test2(arrayView1), 42);
    arrayView1[1023] = 41;
    shouldBe(test2(arrayView1), 41);

    var arrayView2 = new Int8Array(new ArrayBuffer(1024, { maxByteLength: 1024 }), 0, 1024);
    arrayView2[1023] = 42;
    shouldBe(test2(arrayView2), 42);
    shouldBe(arrayView2.length, 1024);
    arrayView2.buffer.resize(0);
    shouldBe(arrayView2.length, 0);
    shouldBe(test2(arrayView2), undefined);
    arrayView2.buffer.resize(1024);
    shouldBe(arrayView2.length, 1024);
    shouldBe(test2(arrayView2), 0);

    for (var i = 0; i < 1e4; ++i)
        shouldBe(test2(arrayView2), 0);
    shouldBe(test2(arrayView1), 41);
}

function test3(view) {
    return view.getInt8(1023);
}
noInline(test3);

{
    var arrayView1 = new DataView(new ArrayBuffer(1024));
    arrayView1.setInt8(1023, 42);
    for (var i = 0; i < 1e4; ++i)
        shouldBe(test3(arrayView1), 42);
    arrayView1.setInt8(1023, 41);
    shouldBe(test3(arrayView1), 41);

    var arrayView2 = new DataView(new ArrayBuffer(1024, { maxByteLength: 1024 }), 0, 1024);
    arrayView2.setInt8(1023, 42);
    shouldBe(test3(arrayView2), 42);
    shouldBe(arrayView2.byteLength, 1024);
    arrayView2.buffer.resize(0);
    shouldThrow(() => {
        arrayView2.byteLength;
    }, `TypeError: Underlying ArrayBuffer has been detached from the view or out-of-bounds`);
    shouldThrow(() => {
        test3(arrayView2);
    }, `TypeError: Underlying ArrayBuffer has been detached from the view or out-of-bounds`);
    arrayView2.buffer.resize(1024);
    shouldBe(arrayView2.byteLength, 1024);
    shouldBe(test3(arrayView2), 0);

    for (var i = 0; i < 1e4; ++i)
        shouldBe(test3(arrayView2), 0);
    shouldBe(test3(arrayView1), 41);
}

function test4(view) {
    return view.getInt8(1023);
}
noInline(test4);

{
    var arrayView1 = new DataView(new ArrayBuffer(1024));
    arrayView1.setInt8(1023, 42);
    for (var i = 0; i < 1e4; ++i)
        shouldBe(test4(arrayView1), 42);
    arrayView1.setInt8(1023, 41);
    shouldBe(test4(arrayView1), 41);

    var arrayView2 = new DataView(new ArrayBuffer(1024, { maxByteLength: 1024 }));
    arrayView2.setInt8(1023, 42);
    shouldBe(test4(arrayView2), 42);
    shouldBe(arrayView2.byteLength, 1024);
    arrayView2.buffer.resize(0);
    shouldBe(arrayView2.byteLength, 0);
    shouldThrow(() => {
        test4(arrayView2);
    }, `RangeError: Out of bounds access`);
    arrayView2.buffer.resize(1024);
    shouldBe(arrayView2.byteLength, 1024);
    shouldBe(test4(arrayView2), 0);

    for (var i = 0; i < 1e4; ++i)
        shouldBe(test4(arrayView2), 0);
    shouldBe(test4(arrayView1), 41);
}
