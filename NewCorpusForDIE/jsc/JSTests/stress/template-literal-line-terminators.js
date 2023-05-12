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


function test(actual, expected) {
    if (actual !== expected)
        throw new Error("bad value: actual: " + actual + ", expected: " + expected);
}

function testEval(script, expected) {
    test(eval(script), expected);
}

function testEvalLineNumber(script, expected, lineNum) {
    testEval(script, expected);

    var error = null;
    var actualLine;
    try {
        eval(script + ';throw new Error("line");');
    } catch (error) {
        actualLine = error.line;
    }
    test(actualLine, lineNum);
}

test(`Hello`, "Hello");
test(`Hello World`, "Hello World");
test(`
`, "\n");
test(`Hello
World`, "Hello\nWorld");

testEvalLineNumber("`Hello World`", "Hello World", 1);

testEvalLineNumber("`Hello\rWorld`", "Hello\nWorld", 2);
testEvalLineNumber("`Hello\nWorld`", "Hello\nWorld", 2);

testEvalLineNumber("`Hello\r\rWorld`", "Hello\n\nWorld", 3);
testEvalLineNumber("`Hello\r\nWorld`", "Hello\nWorld", 2);
testEvalLineNumber("`Hello\n\nWorld`", "Hello\n\nWorld", 3);
testEvalLineNumber("`Hello\n\rWorld`", "Hello\n\nWorld", 3);

testEvalLineNumber("`Hello\n\r\nWorld`", "Hello\n\nWorld", 3);
testEvalLineNumber("`Hello\r\n\rWorld`", "Hello\n\nWorld", 3);
testEvalLineNumber("`Hello\n\n\nWorld`", "Hello\n\n\nWorld", 4);

testEvalLineNumber("`Hello\n\r\n\rWorld`", "Hello\n\n\nWorld", 4);
testEvalLineNumber("`Hello\n\r\n\nWorld`", "Hello\n\n\nWorld", 4);
testEvalLineNumber("`Hello\r\n\n\nWorld`", "Hello\n\n\nWorld", 4);

testEvalLineNumber("`Hello\\\n\r\rWorld`", "Hello\n\nWorld", 4);
testEvalLineNumber("`Hello\\\r\n\n\nWorld`", "Hello\n\nWorld", 4);
testEvalLineNumber("`Hello\\\n\r\n\nWorld`", "Hello\n\nWorld", 4);
testEvalLineNumber("`Hello\\\n\r\r\nWorld`", "Hello\n\nWorld", 4);

testEvalLineNumber("`\u2028`", "\u2028", 2);
testEvalLineNumber("`\u2029`", "\u2029", 2);
testEvalLineNumber("`\\u2028`", "\u2028", 1);
testEvalLineNumber("`\\u2029`", "\u2029", 1);
