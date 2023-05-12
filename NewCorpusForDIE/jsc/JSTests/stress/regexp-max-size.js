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

function testMaxRegExp() {
    let patt = 'A{4294967294}X';
    const re = RegExp(patt);
    return "AAX".match(re);
}

function testTooBigRegExp() {
    let patt = 'A{4294967295}X';
    const re = RegExp(patt);
    return "AAX".match(re);
}

function testMaxBMPRegExp() {
    let patt = '\u{1234}{4294967294}X';
    const re = RegExp(patt, 'u');
    return "\u{1234}\u{1234}X".match(re);
}

function testTooBigBMPRegExp() {
    let patt = '\u{1234}{4294967295}\u{4567}';
    const re = RegExp(patt, 'u');
    return "\u{1234}\u{1234}\u{4567}".match(re);
}

function testMaxNonBMPRegExp() {
    let patt = '\u{10234}{2147483646}\u{10100}';
    const re = RegExp(patt, 'u');
    return "\u{10234}\u{10234}\u{10100}".match(re);
}

function testTooBigNonBMPRegExp() {
    let patt = '\u{10234}{2147483647}\u{10100}';
    const re = RegExp(patt, 'u');
    return "\u{10234}\u{10234}\u{10100}".match(re);
}

let shouldCompile = [testMaxRegExp, testMaxBMPRegExp, testMaxNonBMPRegExp];
let shouldntCompile = [testTooBigRegExp, testTooBigBMPRegExp, testTooBigNonBMPRegExp];

function testAll()
{
    for (let i = 0; i < shouldCompile.length; ++i) {
        if (shouldCompile[i]())
            throw "This RegExp: " + shouldCompile[i] + " should compile and fail to match";
    }

    for (let i = 0; i < shouldntCompile.length; ++i) {
        let notSyntaxError = false;

        try {
            shouldntCompile[i]();
            notSyntaxError = true;
        } catch(e) {
            if (!(e instanceof SyntaxError))
                notSyntaxError = true;
        }

        if (notSyntaxError)
            throw "This RegExp: " + shouldntCompile[i] + " should throw a Syntax Error when it is compiled";
    }
}

testAll();
