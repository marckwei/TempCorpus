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

//@ skip if $architecture == "x86"
//@ $skipModes << :lockdown if $buildType == "debug"

function assert(a) {
    if (!a)
        throw Error("bad assertion");
}

function testRegexpInline(functor) {
    for (let i = 0; i < 100000; i++) {
        functor();
    }

    gc();

    // Create objects to force collected objects be reused
    for (let i = 0; i < 10000000; i++) {
        let a = {value: i};
    }

    // Checking if RegExp were collected
    for (let i = 0; i < 100; i++) {
        functor();
    }
}

function toInlineGlobal() {
    var re = /cc+/;

    assert(re.test("ccc"));
    assert(!re.test("abc"));
    return 0;
}

function withRegexp() {
    toInlineGlobal();
    var re = /(ab)+/;
    assert(re.test("ab"));
    assert(!re.test("ba"));
    return 0;
}

noInline(withRegexp);

testRegexpInline(withRegexp);

function inlineRegexpNotGlobal() {
    let toInline = () => {
        let re = /a+/;

        assert(re.test("aaaaaa"));
        assert(!re.test("bc"));
    }

    toInline();
}

noInline(inlineRegexpNotGlobal);

testRegexpInline(inlineRegexpNotGlobal);

function toInlineRecursive(depth) {
    if (depth == 5) {
        return;
    }

    var re = /(ef)+/;

    assert(re.test("efef"));
    assert(!re.test("abc"));
    
    toInlineRecursive(depth + 1);
}

function regexpContainsRecursive() {
    var re = /r+/;
    toInlineRecursive(0);

    assert(re.test("r"));
    assert(!re.test("ab"));
}
noInline(regexpContainsRecursive);

testRegexpInline(regexpContainsRecursive);

