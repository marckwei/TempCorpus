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

description(
"Regression test for https://webkit.org/b/139808. This test should run without any exceptions."
);

function theClosureFunction(a)
{
    var o = {
        1: "Gur dhvpx oebja sbk whzcrq bire gur ynml qbt\'f onpx.",
        2: "Abj vf gur gvzr sbe nyy zra gb pbzr gb gur nvq bs gurve cnegl.",
        3: "N zna n cyna n pnany, Cnanzn."
    };

    var expect = {
        1: "The quick brown fox jumped over the lazy dog\'s back.",
        2: "Now is the time for all men to come to the aid of their party.",
        3: "A man a plan a canal, Panama."
    };

    e = expect[a]
    a = o[a];

    var rot13 = function(startIndex) {
        result = "";

        for (var i = startIndex; i < a.length; i++) {
            c = a.charAt(i);
            if (c >= 'a' && c <= 'z')
                c = String.fromCharCode((a.charCodeAt(i) - 84) % 26 + 97);
            else if (c >= 'A' && c <= 'Z')
                c = String.fromCharCode((a.charCodeAt(i) - 52) % 26 + 65);

	    result += c;
	}

	return result;
    }

    // Call in a loop to tier up to DFG
    for (var i = 0; i < 1000; i++)
        s = rot13(0);

    return s == e;
}

for (var i = 1; i <= 3; i++)
    if (!theClosureFunction(i))
        throw "Incorrect result calling theClosureFunction";
