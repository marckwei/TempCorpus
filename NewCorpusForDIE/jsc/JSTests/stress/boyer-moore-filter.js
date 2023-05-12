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
    let regexp = /aaaa|(bbb|cccc)/; // => [abc][abc][abc]
    shouldBe(regexp.test("bbb"), true);
    shouldBe(regexp.test("aabb"), false);
}

{
    let regexp = /aaaa|(bbb|cccc)?/; // =>
    shouldBe(regexp.test("bbb"), true);
    shouldBe(regexp.test("aabb"), true);
    shouldBe(regexp.test(""), true);
}

{
    let regexp = /aaaa|a(bbb|cccc)?/; // => [a]
    shouldBe(regexp.test("aaaa"), true);
    shouldBe(regexp.test("a"), true);
    shouldBe(regexp.test("abbb"), true);
    shouldBe(regexp.test("acccc"), true);
    shouldBe(regexp.test("dcccc"), false);
}

{
    let regexp = /aaaa|(bbb|cccc)?dd/; // => [abcd]
    shouldBe(regexp.test("bbb"), false);
    shouldBe(regexp.test("aaaa"), true);
    shouldBe(regexp.test("aabb"), false);
    shouldBe(regexp.test("dd"), true);
}

{
    let regexp = /aaaa|(bbb|cccc?)?dd/; // => [abc][abc][abc]
    shouldBe(regexp.test("bbb"), false);
    shouldBe(regexp.test("aaaa"), true);
    shouldBe(regexp.test("aabb"), false);
    shouldBe(regexp.test("dd"), true);
}

{
    let regexp = /aaaa|(b|cccc)dd/; // => [abc][acd]
    shouldBe(regexp.test("bbb"), false);
    shouldBe(regexp.test("aaaa"), true);
    shouldBe(regexp.test("aabb"), false);
    shouldBe(regexp.test("ccccdd"), true);
    shouldBe(regexp.test("ccccdd"), true);
}

{
    let regexp = /aaaaaaa|(bb?|cc?)dddddd/; // => [abc][acd]
    shouldBe(regexp.test("aaaaaaa"), true);
    shouldBe(regexp.test("bdddddd"), true);
    shouldBe(regexp.test("cdddddd"), true);
    shouldBe(regexp.test("bbdddddd"), true);
    shouldBe(regexp.test("ccdddddd"), true);
    shouldBe(regexp.test("dddddd"), false);
    shouldBe(regexp.test("dddddd"), false);
    shouldBe(regexp.test("bddddd"), false);
    shouldBe(regexp.test("cddddd"), false);
    shouldBe(regexp.test("bbddddd"), false);
    shouldBe(regexp.test("ccddddd"), false);
    shouldBe(regexp.test("aaaaaabdddddd"), true);
    shouldBe(regexp.test("aaaaaacdddddd"), true);
    shouldBe(regexp.test("aaaaaabbdddddd"), true);
    shouldBe(regexp.test("aaaaaaccdddddd"), true);
}

{
    let regexp = /\baaaaaaa|(bb?|cc?)dddddd/; // => [abc][acd]
    shouldBe(regexp.test("aaaaaaa"), true);
    shouldBe(regexp.test("bdddddd"), true);
    shouldBe(regexp.test("cdddddd"), true);
    shouldBe(regexp.test("bbdddddd"), true);
    shouldBe(regexp.test("ccdddddd"), true);
    shouldBe(regexp.test("dddddd"), false);
    shouldBe(regexp.test("dddddd"), false);
    shouldBe(regexp.test("bddddd"), false);
    shouldBe(regexp.test("cddddd"), false);
    shouldBe(regexp.test("bbddddd"), false);
    shouldBe(regexp.test("ccddddd"), false);
    shouldBe(regexp.test("baaaaaaa"), false);
    shouldBe(regexp.test("aaaaaabdddddd"), true);
    shouldBe(regexp.test("aaaaaacdddddd"), true);
    shouldBe(regexp.test("aaaaaabbdddddd"), true);
    shouldBe(regexp.test("aaaaaaccdddddd"), true);
}
