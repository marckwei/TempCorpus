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

// With verbose set to false, this test is successful if there is no output.  Set verbose to true to see expected matches.
let verbose = false;

function arrayToString(arr)
{
  let str = '';
  arr.forEach(function(v, index) {
    if (typeof v == "string")
        str += "\"" + v + "\"";
    else
        str += v;

    if (index != (arr.length - 1)) {
      str += ',';
    };
  });
  return "[" + str + "]";
}

function dumpValue(v)
{
    if (v === null)
        return "<null>";

    if (v === undefined)
        return "<undefined>";

    if (typeof v == "string")
        return "\"" + v + "\"";

    if (v.length)
        return arrayToString(v);

    return v;
}

function compareArray(a, b)
{
    if (a === null && b === null)
        return true;

    if (a === null) {
        print("### a is null, b is not null");
        return false;
    }

    if (b === null) {
        print("### a is not null, b is null");
        return false;
    }

    if (a.length !== b.length) {
        print("### a.length: " + a.length + ", b.length: " + b.length);
        return false;
    }

    for (var i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            print("### a[" + i + "]: \"" + a[i] + "\" !== b[" + i + "]: \"" + b[i] + "\"");
            return false;
        }
    }

    return true;
}

let testNumber = 0;

function testRegExp(re, str, exp)
{
    testNumber++;

    let actual = str.match(re);

    if (compareArray(exp, actual)) {
        if (verbose)
            print(dumpValue(str) +".match(" + re.toString() + "), passed ", dumpValue(exp));
    } else
        print(dumpValue(str) +".match(" + re.toString() + "), FAILED test #" + testNumber + ", Expected ", dumpValue(exp), " got ", dumpValue(actual));
}

// Test 1
testRegExp(/c(?!(\D))|c/u, "abcdef", ["c", undefined]);
testRegExp(/c(?!(\D){3})|c/u, "abcdef", ["c", undefined]);
testRegExp(/c(?=(de)x)|c/u, "abcdef", ["c", undefined]);
testRegExp(/c(?=(def))x|c/u, "abcdef", ["c", undefined]);
testRegExp(/c(?=(def))x|c(?!(def))|c/, "abcdef", ["c", undefined, undefined]);

// Test 6
testRegExp(/(?<!(\D{3}))f|f/u, "abcdef", ["f", undefined]);
testRegExp(/(?<!(\D{3}))f/, "abcdef", null);
testRegExp(/(?<!(\D))f/u, "abcdef", null);
testRegExp(/(?<!(\D){3})f/u, "abcdef", null);
testRegExp(/(?<!(\D){3})f|f/u, "abcdef", ["f", undefined]);

// Test 11
testRegExp(/(?<=(\w){6})f/, "abcdef", null);
testRegExp(/f(?=(\w{6})})/, "abcdef", null);
testRegExp(/((?<!\D{3}))f|f/u, "abcdef", ["f", undefined]);
testRegExp(/(?<!(\D){3})f/, "abcdef", null);
testRegExp(/(?<!(\d){3})f/, "abcdef", ["f", undefined]);

// Test 16
testRegExp(/(?<!(\D){3})f/, "abcdef", null);
testRegExp(/(?<!(\D){3})f|f/, "abcdef", ["f", undefined]);
testRegExp(/((?<!\D{3}))f|f/, "abcdef", ["f", undefined]);
testRegExp(/(?<!(\w{3}))f(?=(\w{3}))|(?<=(\w+?))c(?=(\w{2}))|(?<=(\w{4}))c(?=(\w{3})$)/, "abcdef", ["c",undefined,undefined,"b","de",undefined,undefined]);
testRegExp(/abc|(efg).*\!|xyz/, "efg xyz", ["xyz", undefined]);
