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

function assertSyntaxError(code) {
    try {
        eval(code);
        throw new Error("Should throw SyntaxError, but executed code without throwing");
    } catch(e) {
        if (!e instanceof SyntaxError)
            throw new Error("Should throw SyntaxError, but threw " + e);
    }
}

assertSyntaxError("let C = class { #constructor() {} }");
assertSyntaxError("let C = class { static #constructor() {} }");
assertSyntaxError("class C { #constructor() {} }");
assertSyntaxError("class C { static #constructor() {} }");

assertSyntaxError("let C = class { get #constructor() {} }");
assertSyntaxError("let C = class { static get #constructor() {} }");
assertSyntaxError("class C { get #constructor() {} }");
assertSyntaxError("class C { static get #constructor() {} }");

assertSyntaxError("let C = class { set #constructor(v) {} }");
assertSyntaxError("let C = class { static set #constructor(v) {} }");
assertSyntaxError("class C { set #constructor(v) {} }");
assertSyntaxError("class C { static set #constructor(v) {} }");

assertSyntaxError("let C = class { #constructor; }");
assertSyntaxError("let C = class { static #constructor; }");
assertSyntaxError("class C { #constructor; }");
assertSyntaxError("class C { static #constructor; }");

