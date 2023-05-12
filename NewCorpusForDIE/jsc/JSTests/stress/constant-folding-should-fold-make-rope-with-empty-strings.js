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

function unknown()
{
    return "OK";
}
noInline(unknown);

function readWord1(flag)
{
    var word = "";
    if (flag) {
        word += unknown();
    }
    return word + "HelloWorld";
}
noInline(readWord1);

function readWord2(flag)
{
    var word = "";
    if (flag) {
        word += unknown();
    }
    return "HelloWorld" + word;
}
noInline(readWord2);

function readWord3(flag)
{
    var word = "";
    if (flag) {
        word += unknown();
    }
    return "" + word;
}
noInline(readWord3);

function readWord4(flag)
{
    var word = "";
    if (flag) {
        word += unknown();
    }
    return "HelloWorld" + word + word;
}
noInline(readWord4);

for (var i = 0; i < 1e6; ++i) {
    shouldBe(readWord1(false), "HelloWorld");
    shouldBe(readWord2(false), "HelloWorld");
    shouldBe(readWord3(false), "");
    shouldBe(readWord4(false), "HelloWorld");
}
shouldBe(readWord1(true), "OKHelloWorld");
shouldBe(readWord2(true), "HelloWorldOK");
shouldBe(readWord3(true), "OK");
shouldBe(readWord4(true), "HelloWorldOKOK");
