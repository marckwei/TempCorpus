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
    "See spec: http://www.ecma-international.org/ecma-262/6.0/index.html#sec-statements"
);

var AllShouldThrow = "AllShouldThrow";
var NoneShouldThrow = "NoneShouldThrow";

function testSyntax(asBlock, body, throwStatus) {
    var open = asBlock ? '{' : '';
    var close = asBlock ? '}' : '';

    var commonLanguageConstructs = [
        `for (var i = 0; i < 4; i++) ${open} ${body} ${close}`,
        `for (var i in {}) ${open} ${body} ${close}`,
        `for (i in {}) ${open} ${body} ${close}`,
        `for (var i of []) ${open} ${body} ${close}`,
        `for (i of []) ${open} ${body} ${close}`,
        `while (i = 0) ${open} ${body} ${close}`,
        `do ${open} ${body} ${close} while (i = 0)`,
        `if (i = 0) ${open} ${body} ${close}`,
        `if (i = 0) ${open} ${body} ${close} else ${open} ${body} ${close}`,
        `if (i = 0) i++; else ${open} ${body} ${close}`,
        `if (i = 0) ${open} ${body} ${close} else i++;`,
        `with ({}) ${open} ${body} ${close}`,
    ];

    for (var languageFeature of commonLanguageConstructs) {
        try {
            eval(languageFeature);
            if (throwStatus === AllShouldThrow) {
                testFailed(languageFeature);
                return;
            }
            testPassed(`Did not have syntax error: '${languageFeature}'`);
        } catch (e) {
            if (throwStatus === NoneShouldThrow) {
                testFailed(languageFeature);
                return;
            }
            testPassed(`Had syntax error '${languageFeature}'`);
        }
    }
}

function runTests() {
    var bodies = [
        "class C {};",
        "class C extends (class A {}) {};",
        "const c = 40;",
        "const c = 40, d = 50;",
        "let c = 40;",
        "let c = 40, d = 50;"
    ];
    for (var body of bodies) {
        testSyntax(true, body, NoneShouldThrow);
        testSyntax(false, body, AllShouldThrow);
    }
}
runTests();
