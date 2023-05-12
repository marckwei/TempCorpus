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

// This test should pass without crashing.

function testRegExp(re, str, expected)
{
    let match = re.exec(str);

    let errors = "";
    
    if (match) {
        if (!expected)
            errors += "\nExpected no match, but got: " + match;
        else {
            if (match.length != expected.length)
                errors += "\nExpected to match " + expected.length - 1 + " groups, but matched " + match.length - 1 +  " groups.\n";
            if (match[0] != expected[0])
                errors += "\nExpected results \"" + expected[0] + "\", but got \"" + match[0] + "\"";

            let checkLength = Math.min(match.length, expected.length);
            for (i = 1; i < checkLength; ++i) {
                if (match[i] != expected[i])
                    errors += "\nExpected group " + (i - 1) + " to be \"" + expected[i] + "\", but got \"" + match[i] + "\"";
            }
        }
    } else if (expected)
        errors += "\nExpected a match of " + expected + ", but didn't match";

    if (errors.length)
        throw errors.substring(1);
}

testRegExp(/^(.)\1*(\1.)/, "    ", ["    ", " ", "  "]);
testRegExp(/^(.)\1*(\1+?)a/, "    ", undefined);

testRegExp(/^(.)\1*?(.+)/, "xxxx", ["xxxx", "x", "xxx"]);

testRegExp(/^(.{2})\1*(.+)/, "xxxx", ["xxxx", "xx", "xx"]);
testRegExp(/^(.{2})\1*?(.+)/, "xxxx", ["xxxx", "xx", "xx"]);

testRegExp(/^(.{2})\1*(.+)/, "xxx", ["xxx", "xx", "x"]);
testRegExp(/^(.{2})\1*?(.+)/, "xxx", ["xxx", "xx", "x"]);

testRegExp(/^(.)\1*(.+)/s, "=======", ["=======", "=", "="]);
testRegExp(/^(.)\1*?(.+)/s, "=======", ["=======", "=", "======"]);

testRegExp(/^(.)\1*(X)/s, "======X", ["======X", "=", "X"]);
testRegExp(/^(.)\1*?(X)/s, "======X", ["======X", "=", "X"]);
