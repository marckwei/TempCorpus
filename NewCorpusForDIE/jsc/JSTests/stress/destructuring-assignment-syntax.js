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

testSyntax("[] = []");
testSyntax("[] = [,]");
testSyntax("[,] = [,]");
testSyntax("[,] = []");

testSyntax("({ a: this.a } = {})");
testSyntax("({ a: this['a'] } = {})");
testSyntax("({ a: this[\"a\"] } = {})");
testSyntax("[this.a ] = []");
testSyntax("[this['a']] = []");
testSyntax("[this[0]] = []");
testSyntax("[...this[0]] = []");
testSyntax("[...[function f() {}.prop]] = []");
testSyntax("[...[{prop: 1}.prop]] = []");
testSyntax("[...[this[0], ...this[1]]] = []");
testSyntax("({ a: obj.a } = {})");
testSyntax("({ a: obj['a'] } = {})");
testSyntax("({ a: obj[\"a\"] } = {})");
testSyntax("({ a: function() {}['prop'] } = {})");
testSyntax("({ a: {prop: 1}.prop } = {})");
testSyntax("[obj.a ] = []");
testSyntax("[obj['a']] = []");
testSyntax("[obj[0]] = []");
testSyntax("[function(){}.prop] = []");
testSyntax("[{prop: 1}.prop] = []");


testSyntaxError("[...c = 1] = []", "SyntaxError: Unexpected token '='. Expected a closing ']' following a rest element destructuring pattern.");
testSyntaxError("[...c, d] = []", "SyntaxError: Unexpected token ','. Expected a closing ']' following a rest element destructuring pattern.");
testSyntaxError("[this] = []", "SyntaxError: Invalid destructuring assignment target.");
testSyntaxError("[th\\u{69}s] = []", "SyntaxError: Unexpected escaped characters in keyword token: 'th\\u{69}s'");
testSyntaxError("[function() {}] = []", "SyntaxError: Invalid destructuring assignment target.");
testSyntaxError("['string'] = []", "SyntaxError: Invalid destructuring assignment target.");
testSyntaxError("[123] = []", "SyntaxError: Invalid destructuring assignment target.");
testSyntaxError("[true] = []", "SyntaxError: Invalid destructuring assignment target.");
testSyntaxError("[tru\\u0065] = []", "SyntaxError: Unexpected escaped characters in keyword token: 'tru\\u0065'");
testSyntaxError("[false] = []", "SyntaxError: Invalid destructuring assignment target.");
testSyntaxError("[f\\u0061lse] = []", "SyntaxError: Unexpected escaped characters in keyword token: 'f\\u0061lse'");
testSyntaxError("[null] = []", "SyntaxError: Invalid destructuring assignment target.");
testSyntaxError("[n\\u{75}ll] = []", "SyntaxError: Unexpected escaped characters in keyword token: 'n\\u{75}ll'");

testSyntaxError("'use strict'; ({ eval } = {})", "SyntaxError: Cannot modify 'eval' in strict mode.");
testSyntaxError("'use strict'; ({ eval = 0 } = {})", "SyntaxError: Cannot modify 'eval' in strict mode.");
testSyntaxError("'use strict'; ({ a: eval } = {})", "SyntaxError: Cannot modify 'eval' in strict mode.");
testSyntaxError("'use strict'; ({ a: eval = 0 } = {})", "SyntaxError: Cannot modify 'eval' in strict mode.");
testSyntaxError("'use strict'; ({ arguments } = {})", "SyntaxError: Cannot modify 'arguments' in strict mode.");
testSyntaxError("'use strict'; ({ arguments = 0 } = {})", "SyntaxError: Cannot modify 'arguments' in strict mode.");
testSyntaxError("'use strict'; ({ a: arguments } = {})", "SyntaxError: Cannot modify 'arguments' in strict mode.");
testSyntaxError("'use strict'; ({ a: arguments = 0 } = {})", "SyntaxError: Cannot modify 'arguments' in strict mode.");
testSyntaxError("'use strict'; ([ eval ] = [])", "SyntaxError: Cannot modify 'eval' in strict mode.");
testSyntaxError("'use strict'; ([ eval = 0 ] = [])", "SyntaxError: Cannot modify 'eval' in strict mode.");
testSyntaxError("'use strict'; ([ arguments ] = [])", "SyntaxError: Cannot modify 'arguments' in strict mode.");
testSyntaxError("'use strict'; ([ arguments = 0 ] = [])", "SyntaxError: Cannot modify 'arguments' in strict mode.");
