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

function assert(b) {
    if (!b)
        throw new Error("Bad assertion")
}

function shouldBeSyntaxError(str) {
    let failed = true;
    try {
        new Function(str);
    } catch(e) {
        if (e instanceof SyntaxError)
            failed = false;
    }
    
    if (failed)
        throw new Error("Did not throw syntax error: " + str);
}

function shouldNotBeSyntaxError(str) {
    let failed = false;
    try {
        new Function(str);
    } catch(e) {
        if (e instanceof SyntaxError && e.message.indexOf("new.target") !== -1)
            failed = true;
    }
    
    if (failed)
        throw new Error("Did throw a syntax error: " + str);
}


let operators = ["=", "+=", "-=", "*=", "<<=", ">>=", ">>>=", "&=", "^=", "|=", "%="];
for (let operator of operators) {
    let functionBody = `new.target ${operator} 20`;
    shouldBeSyntaxError(functionBody);

    functionBody = `foo = new.target ${operator} 20`;
    shouldBeSyntaxError(functionBody);

    functionBody = `foo ${operator} new.target ${operator} 20`;
    shouldBeSyntaxError(functionBody);

    functionBody = `new.target ${operator} foo *= 40`;
    shouldBeSyntaxError(functionBody);


    // Make sure our tests cases our sound and they should not be syntax errors if new.target is replaced by foo
    functionBody = `foo ${operator} 20`;
    shouldNotBeSyntaxError(functionBody);

    functionBody = `foo = foo ${operator} 20`;
    shouldNotBeSyntaxError(functionBody);

    functionBody = `foo ${operator} foo ${operator} 20`;
    shouldNotBeSyntaxError(functionBody);

    functionBody = `foo ${operator} foo *= 40`;
    shouldNotBeSyntaxError(functionBody);
}

let prePostFixOperators = ["++", "--"];
for (let operator of prePostFixOperators) {
    let functionBody = `${operator}new.target`;
    shouldBeSyntaxError(functionBody);

    functionBody = `foo = ${operator}new.target`;
    shouldBeSyntaxError(functionBody);

    functionBody = `${operator}foo`;
    shouldNotBeSyntaxError(functionBody);

    functionBody = `foo = ${operator}foo`;
    shouldNotBeSyntaxError(functionBody);
}

for (let operator of prePostFixOperators) {
    let functionBody = `new.target${operator}`;
    shouldBeSyntaxError(functionBody);

    functionBody = `foo = new.target${operator}`;
    shouldBeSyntaxError(functionBody);

    functionBody = `foo${operator}`;
    shouldNotBeSyntaxError(functionBody);

    functionBody = `foo = foo${operator}`;
    shouldNotBeSyntaxError(functionBody);
}

let otherUnaryOperators = ["!", "~", "+", "-", "typeof ", "void ", "delete "];
for (let operator of otherUnaryOperators) {
    function strict(body) { return `"use strict" ${body}`; }
    let functionBody = `${operator}new.target`;
    shouldNotBeSyntaxError(functionBody);
    shouldNotBeSyntaxError(strict(functionBody));
}

shouldBeSyntaxError(`({foo: new.target} = {foo:20})`);

// Scripts - 15.1.1 Static Semantics: Early Errors
// https://tc39.github.io/ecma262/#sec-scripts-static-semantics-early-errors
//
// Modules - 15.2.1.1 Static Semantics: Early Errors
// https://tc39.github.io/ecma262/#sec-module-semantics-static-semantics-early-errors
//
// new.target is not allowed in arrow functions in global scope.

let sawSyntaxError;

sawSyntaxError = false;
try {
    eval(`() => new.target`);
} catch(e) {
    sawSyntaxError = e instanceof SyntaxError;
}
assert(sawSyntaxError);

sawSyntaxError = false;
try {
    eval(`() => { new.target }`);
} catch(e) {
    sawSyntaxError = e instanceof SyntaxError;
}
assert(sawSyntaxError);

sawSyntaxError = false;
try {
    eval(`async () => new.target`);
} catch(e) {
    sawSyntaxError = e instanceof SyntaxError;
}
assert(sawSyntaxError);

sawSyntaxError = false;
try {
    eval(`async () => { new.target }`);
} catch(e) {
    sawSyntaxError = e instanceof SyntaxError;
}
assert(sawSyntaxError);

sawSyntaxError = false;
try {
    eval(`async () => await new.target`);
} catch(e) {
    sawSyntaxError = e instanceof SyntaxError;
}
assert(sawSyntaxError);

sawSyntaxError = false;
try {
    eval(`async () => { await new.target }`);
} catch(e) {
    sawSyntaxError = e instanceof SyntaxError;
}
assert(sawSyntaxError);

let sawError = false;
try {
    new Function(`() => new.target`);
    new Function(`() => { new.target }`);
    new Function(`async () => new.target`);
    new Function(`async () => { new.target }`);
    new Function(`async () => await new.target`);
    new Function(`async () => { await new.target }`);

    function f() { () => new.target };
    function f() { () => { new.target } };
    function f() { async () => new.target };
    function f() { async () => { new.target } };
    function f() { async () => await new.target };
    function f() { async () => { await new.target } };

    (function() { eval(`() => new.target`) })();
    (function() { eval(`() => { new.target }`) })();
    (function() { eval(`async () => new.target`) })();
    (function() { eval(`async () => { new.target }`) })();
    (function() { eval(`async () => await new.target`) })();
    (function() { eval(`async () => { await new.target }`) })();
} catch (e) {
    sawError = true;
}
assert(!sawError);
