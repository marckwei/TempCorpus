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

let intrinsics = [
    "Array.prototype.indexOf",
    "Array.prototype.pop",
    "Array.prototype.push",
    "Array.prototype.slice",
    "DataView.prototype.getInt8",
    "DataView.prototype.getUint8",
    "DataView.prototype.getInt16",
    "DataView.prototype.getUint16",
    "DataView.prototype.getInt32",
    "DataView.prototype.getUint32",
    "DataView.prototype.getFloat32",
    "DataView.prototype.getFloat64",
    "DataView.prototype.setInt8",
    "DataView.prototype.setUint8",
    "DataView.prototype.setInt16",
    "DataView.prototype.setUint16",
    "DataView.prototype.setInt32",
    "DataView.prototype.setUint32",
    "DataView.prototype.setFloat32",
    "DataView.prototype.setFloat64",
    "Map.prototype.get",
    "Map.prototype.has",
    "Map.prototype.set",
    "Math.abs",
    "Math.acos",
    "Math.asin",
    "Math.atan",
    "Math.acosh",
    "Math.asinh",
    "Math.atanh",
    "Math.cbrt",
    "Math.ceil",
    "Math.clz32",
    "Math.cos",
    "Math.cosh",
    "Math.exp",
    "Math.expm1",
    "Math.floor",
    "Math.fround",
    "Math.log",
    "Math.log10",
    "Math.log1p",
    "Math.log2",
    "Math.max",
    "Math.min",
    "Math.pow",
    "Math.random",
    "Math.round",
    "Math.sin",
    "Math.sinh",
    "Math.sqrt",
    "Math.tan",
    "Math.tanh",
    "Math.trunc",
    "Math.imul",
    "Number.isInteger",
    "Number.prototype.toString",
    "Object.create",
    "Object.getPrototypeOf",
    "Object.is",
    "Object.prototype.hasOwnProperty",
    "parseInt",
    "Set.prototype.add",
    "Set.prototype.has",
    "String.fromCharCode",
    "String.prototype.charCodeAt",
    "String.prototype.charAt",
    "String.prototype.replace",
    "String.prototype.slice",
    "String.prototype.toLowerCase",
    "String.prototype.valueOf",
    "Reflect.getPrototypeOf",
    "RegExp.prototype.exec",
    "RegExp.prototype.test",
    "WeakMap.prototype.get",
    "WeakMap.prototype.has",
    "WeakMap.prototype.set",
    "WeakSet.prototype.add",
    "WeakSet.prototype.has",
];

if (typeof Atomics !== "undefined") {
    intrinsics = intrinsics.concat([
        "Atomics.add",
        "Atomics.and",
        "Atomics.compareExchange",
        "Atomics.exchange",
        "Atomics.isLockFree",
        "Atomics.load",
        "Atomics.or",
        "Atomics.store",
        "Atomics.sub",
        "Atomics.wait",
        "Atomics.notify",
        "Atomics.xor",
    ]);
}

function testGetter(intrinsic) {
    let runTest = new Function(
        "let x = {};" + "\n" +
        "x.__defineGetter__('a', " + intrinsic + ");" + "\n" +
        "function test() {  x['a']; }" + "\n" +
        "for (let i = 0; i < 1000; i++) {" + "\n" +
        "    try { test(); } catch(e) { }" + "\n" +
        "}");
    runTest();
}

function testSetter(intrinsic) {
    let runTest = new Function(
        "let x = {};" + "\n" +
        "x.__defineSetter__('a', " + intrinsic + ");" + "\n" +
        "function test() {  x['a'] = 42; }" + "\n" +
        "for (let i = 0; i < 1000; i++) {" + "\n" +
        "    try { test(); } catch(e) { }" + "\n" +
        "}");
    runTest();
}

for (var i = 0; i < intrinsics.length; ++i) {
    testGetter(intrinsics[i]);
    testSetter(intrinsics[i]);
}
