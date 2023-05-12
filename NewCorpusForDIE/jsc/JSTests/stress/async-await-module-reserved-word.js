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

function shouldThrow(func, errorMessage) {
    var errorThrown = false;
    var error = null;
    try {
        func();
    } catch (e) {
        errorThrown = true;
        error = e;
    }
    if (!errorThrown)
        throw new Error('not thrown');
    if (String(error) !== errorMessage)
        throw new Error(`bad error: ${String(error)}`);
}

function checkModuleSyntaxError(source, errorMessage) {
    shouldThrow(() => checkModuleSyntax(source), errorMessage);
}

checkModuleSyntaxError(String.raw`
var await;
`, `SyntaxError: Cannot use 'await' as a variable name in a module.:2`);
checkModuleSyntaxError(`
export var await;
`, `SyntaxError: Cannot use 'await' as a variable name in a module.:2`);
checkModuleSyntaxError(String.raw`
let await;
`, `SyntaxError: Cannot use 'await' as a lexical variable name in a module.:2`);
checkModuleSyntaxError(String.raw`
export let await;
`, `SyntaxError: Cannot use 'await' as a lexical variable name in a module.:2`);
checkModuleSyntaxError(String.raw`
const await = 1
`, `SyntaxError: Cannot use 'await' as a lexical variable name in a module.:2`);
checkModuleSyntaxError(String.raw`
export const await = 1
`, `SyntaxError: Cannot use 'await' as a lexical variable name in a module.:2`);

checkModuleSyntaxError(String.raw`
function await() {}
`, `SyntaxError: Cannot declare function named 'await' in a module.:2`);
checkModuleSyntaxError(String.raw`
function* await() {}
`, `SyntaxError: Cannot declare function named 'await' in a module.:2`);
checkModuleSyntaxError(String.raw`
async function await() {}
`, `SyntaxError: Cannot declare function named 'await' in a module.:2`);

checkModuleSyntaxError(String.raw`
import {await} from 'foo';
`, `SyntaxError: Cannot use 'await' as an imported binding name.:2`);
checkModuleSyntaxError(String.raw`
import {foo as await} from 'foo';
`, `SyntaxError: Cannot use 'await' as an imported binding name.:2`);
checkModuleSyntaxError(String.raw`
import * as await from 'foo';
`, `SyntaxError: Cannot use 'await' as an imported binding name.:2`);
checkModuleSyntaxError(String.raw`
import await, {x, y, z} from 'foo';
`, `SyntaxError: Cannot use 'await' as an imported binding name.:2`);
checkModuleSyntaxError(String.raw`
import await, {x, y, z,} from 'foo';
`, `SyntaxError: Cannot use 'await' as an imported binding name.:2`);
checkModuleSyntaxError(String.raw`
import await from 'foo';
`, `SyntaxError: Cannot use 'await' as an imported binding name.:2`);
checkModuleSyntaxError(String.raw`
import await, * as foo from 'foo';
`, `SyntaxError: Cannot use 'await' as an imported binding name.:2`);
