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

function whatToTest(code){return {allowExec: true,};}
function tryRunning(f, code, wtt)
{
    uneval = true
    try {var rv = f();} catch(runError) {}
    try {if ('__defineSetter__' in this) {delete this.uneval;} } catch(e) {}
}
function tryItOut(code)
{
    var wtt = true;
    var f;
    try {f = new Function(code);} catch(compileError) {}
        tryRunning(f, code, wtt);
}
tryItOut(`a0 = []; 
        r0 = /x/; 
        t0 = new Uint8ClampedArray;
        o1 = {};
        g1 = this;
        v2 = null;`);

tryItOut("func = (function(x, y) {});");
tryItOut("for (var p in g1) { this.a0[new func([].map(q => q, null), x)]; }");
tryItOut("a0.push(o1.m1);a0.length = (4277);a0.__proto__ = this.t0;");
tryItOut("\"use strict\"; a0 = Array.prototype.map.call(a0, (function() {}));");
