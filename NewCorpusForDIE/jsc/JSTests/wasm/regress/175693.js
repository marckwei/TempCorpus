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

const file = "175693.wasm";

const verbose = false;

if (typeof console === 'undefined') {
    console = { log: print };
}
var binary;
if (typeof process === 'object' && typeof require === 'function' /* node.js detection */) {
    var args = process.argv.slice(2);
    binary = require('fs').readFileSync(file);
    if (!binary.buffer) binary = new Uint8Array(binary);
} else {
    var args;
    if (typeof scriptArgs != 'undefined') {
        args = scriptArgs;
    } else if (typeof arguments != 'undefined') {
        args = arguments;
    }
    if (typeof readbuffer === 'function') {
        binary = new Uint8Array(readbuffer(file));
    } else {
        binary = read(file, 'binary');
    }
}
var instance = new WebAssembly.Instance(new WebAssembly.Module(binary), {});
if (instance.exports.hangLimitInitializer) instance.exports.hangLimitInitializer();
try {
    if (verbose)
        console.log('calling: func_0');
    instance.exports.func_0();
} catch (e) {
    if (verbose)
        console.log('   exception: ' + e);
}
if (instance.exports.hangLimitInitializer) instance.exports.hangLimitInitializer();
try {
    if (verbose)
        console.log('calling: hangLimitInitializer');
    instance.exports.hangLimitInitializer();
} catch (e) {
    if (verbose)
        console.log('   exception: ' + e);
}
if (verbose)
    console.log('done.')
