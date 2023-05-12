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

function assertEq(a, b) {
    if (a !== b)
        throw new Error("values not the same: " + a + " and " + b);
}

var allowDoubleShape = $vm.allowDoubleShape();

function withArrayArgInt32(i, array) {
    let result = array[i];
    assertEq($vm.indexingMode(array), "CopyOnWriteArrayWithInt32");
}
noInline(withArrayArgInt32);

function withArrayLiteralInt32(i) {
    let array = [0,1,2];
    let result = array[i];
    assertEq($vm.indexingMode(array), "CopyOnWriteArrayWithInt32");
}
noInline(withArrayLiteralInt32);


function withArrayArgDouble(i, array) {
    let result = array[i];
    if (allowDoubleShape)
        assertEq($vm.indexingMode(array), "CopyOnWriteArrayWithDouble");
    else
        assertEq($vm.indexingMode(array), "CopyOnWriteArrayWithContiguous");
}
noInline(withArrayArgDouble);

function withArrayLiteralDouble(i) {
    let array = [0,1.3145,2];
    let result = array[i];
    if (allowDoubleShape)
        assertEq($vm.indexingMode(array), "CopyOnWriteArrayWithDouble");
    else
        assertEq($vm.indexingMode(array), "CopyOnWriteArrayWithContiguous");        
}
noInline(withArrayLiteralDouble);

function withArrayArgContiguous(i, array) {
    let result = array[i];
    assertEq($vm.indexingMode(array), "CopyOnWriteArrayWithContiguous");
}
noInline(withArrayArgContiguous);

function withArrayLiteralContiguous(i) {
    let array = [0,"string",2];
    let result = array[i];
    assertEq($vm.indexingMode(array), "CopyOnWriteArrayWithContiguous");
}
noInline(withArrayLiteralContiguous);

function test() {
    withArrayArgInt32(0, [0,1,2]);
    withArrayArgDouble(0, [0,1.3145,2]);
    withArrayArgContiguous(0, [0,"string",2]);

    withArrayLiteralInt32(0);
    withArrayLiteralDouble(0);
    withArrayLiteralContiguous(0);
}

for (let i = 0; i < 10000; i++)
    test();
