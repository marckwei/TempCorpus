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
'Test RegExp.compile method.'
);

re = new RegExp("a", "i");
shouldBe("re.toString()", "'/a/i'");

re.compile("a");
shouldBe("re.multiline", "false");
shouldBe("re.ignoreCase", "false");
shouldBe("re.global", "false");
shouldBe("re.test('A')", "false");
shouldBe("re.toString()", "'/a/'");

re.compile("b", "g");
shouldBe("re.toString()", "'/b/g'");

re.compile(new RegExp("c"));
shouldBe("re.toString()", "'/c/'");

re.compile(new RegExp("c", "i"));
shouldBe("re.ignoreCase", "true");
shouldBe("re.test('C')", "true");
shouldBe("re.toString()", "'/c/i'");

shouldThrow("re.compile(new RegExp('c'), 'i');");

// It's OK to supply a second argument, as long as the argument is "undefined".
re.compile(re, undefined);
shouldBe("re.toString()", "'/c/i'");

shouldThrow("re.compile(new RegExp('+'));");

re.compile();
shouldBe("re.toString()", "'/(?:)/'");
re.compile(undefined);
shouldBe("re.toString()", "'/(?:)/'");
re.compile("");
shouldBe("re.toString()", "'/(?:)/'");

re.compile(null);
shouldBe("re.toString()", "'/null/'");

re.compile("z", undefined);
shouldBe("re.toString()", "'/z/'");

// Compiling should reset lastIndex.
re.lastIndex = 100;
re.compile(/a/g);
shouldBe("re.lastIndex", "0");
re.exec("aaa");
shouldBe("re.lastIndex", "1");

// Compile returns the regexp itself.
shouldBe("regexpWithUndefinedCompiledToValid = new RegExp(undefined), regexpWithUndefinedCompiledToValid.compile('abc')", "regexpWithUndefinedCompiledToValid");
shouldBe("regexpValidPatternCompiledToValid = new RegExp('zyx'), regexpValidPatternCompiledToValid.compile('abc')", "regexpValidPatternCompiledToValid");
shouldBe("regexpWithValidCompiledToUndefined = new RegExp('abc'), regexpWithValidCompiledToUndefined.compile(undefined)", "regexpWithValidCompiledToUndefined");
