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

function tag() {
}

function testSyntax(script) {
    try {
        eval(script);
    } catch (error) {
        if (error instanceof SyntaxError)
            throw new Error("Bad error: " + String(error));
    }
}

function testSyntaxError(script, message) {
    var error = null;
    try {
        eval(script);
    } catch (e) {
        error = e;
    }
    if (!error)
        throw new Error("Expected syntax error not thrown");

    if (String(error) !== message)
        throw new Error("Bad error: " + String(error));
}

testSyntax("tag``");
testSyntax("tag`Hello`");
testSyntax("tag`Hello${tag}`");
testSyntax("tag`${tag}`");
testSyntax("tag`${tag} ${tag}`");
testSyntax("tag`${tag}${tag}`");

testSyntax("tag.prop``");
testSyntax("tag.prop`Hello`");
testSyntax("tag.prop`Hello${tag}`");
testSyntax("tag.prop`${tag}`");
testSyntax("tag.prop`${tag} ${tag}`");
testSyntax("tag.prop`${tag}${tag}`");

testSyntax("tag[prop]``");
testSyntax("tag[prop]`Hello`");
testSyntax("tag[prop]`Hello${tag}`");
testSyntax("tag[prop]`${tag}`");
testSyntax("tag[prop]`${tag} ${tag}`");
testSyntax("tag[prop]`${tag}${tag}`");

testSyntax("(tag())``");
testSyntax("(tag())`Hello`");
testSyntax("(tag())`Hello${tag}`");
testSyntax("(tag())`${tag}`");
testSyntax("(tag())`${tag} ${tag}`");
testSyntax("(tag())`${tag}${tag}`");

testSyntax("(class { say() { super.tag`` } })");
testSyntax("(class { say() { super.tag`Hello` } })");
testSyntax("(class { say() { super.tag`Hello${tag}` } })");
testSyntax("(class { say() { super.tag`${tag}` } })");
testSyntax("(class { say() { super.tag`${tag} ${tag}` } })");
testSyntax("(class { say() { super.tag`${tag}${tag}` } })");

testSyntax("(class extends Hello { constructor() { super()`` } })");
testSyntax("(class extends Hello { constructor() { super()`Hello` } })");
testSyntax("(class extends Hello { constructor() { super()`Hello${tag}` } })");
testSyntax("(class extends Hello { constructor() { super()`${tag}` } })");
testSyntax("(class extends Hello { constructor() { super()`${tag} ${tag}` } })");
testSyntax("(class extends Hello { constructor() { super()`${tag}${tag}` } })");

testSyntaxError("super`Hello${tag}`", "SyntaxError: super is not valid in this context.");
testSyntaxError("(class { say() { super`Hello${tag}` } })", "SyntaxError: Cannot use super as tag for tagged templates.");
