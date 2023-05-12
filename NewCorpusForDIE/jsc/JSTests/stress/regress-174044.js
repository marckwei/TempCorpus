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

// Regression test for https://bugs.webkit.org/show_bug.cgi?id=174044.  This test should not throw or crash.

function test1()
{
    let expected = ["\na", "\na", "\na", "\n"];

    let str = "\na\na\na\n";
    let re = new RegExp(".*\\s.*", "g");

    let match = str.match(re);

    if (match.length != expected.length)
        throw "Expected match.length of " + expected.length + ", got " + match.length;

    for (let i = 0; i < expected.length; i++) {
        if (match[i] != expected[i])
            throw "Expected match[" + i + "] to be \"" + expected[i] + "\", got \"" + match[i] + "\"";
    }
}

function test2()
{
    let result = undefined;

    let re = new RegExp(".*\\s.*", "g");
    let str = "\na\n";
    result = str.replace(re,'x');

    if (result != "xx")
        throw "Expected result of \"xx\", got \"" + result + "\"";
}

for (let i = 0; i < 5000; i++)
    test1();

for (let i = 0; i < 5000; i++)
    test2();
