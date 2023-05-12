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

//@requireOptions("--useImportAssertion=true")

var list = [
    String.raw`import v from "mod"`,
    String.raw`import * as ns from "mod"`,
    String.raw`import {x} from "mod"`,
    String.raw`import {x,} from "mod"`,
    String.raw`import {} from "mod"`,
    String.raw`import {x as v} from "mod"`,
    String.raw`export {x} from "mod"`,
    String.raw`export {v as x} from "mod"`,
    String.raw`export * from "mod"`,
    String.raw`export * as b from "Cocoa"`,
    String.raw`export * as delete from "Cocoa"`,
    String.raw`import a, { b as c } from "Cocoa"`,
    String.raw`import d, { e, f, g as h } from "Cappuccino"`,
    String.raw`import { } from "Cappuccino"`,
    String.raw`import i, * as j from "Cappuccino"`,
    String.raw`import a, { } from "Cappuccino"`,
    String.raw`import a, { b, } from "Cappuccino"`,
    String.raw`import * as from from "Matcha"`,
    String.raw`import * as as from "Cocoa"`,
    String.raw`import { default as module } from "Cocoa"`,
    String.raw`export * from "Cocoa"`,
    String.raw`export { } from "Cocoa"`,
    String.raw`export { a } from "Cocoa"`,
    String.raw`export { a as b } from "Cocoa"`,
    String.raw`export { a, b } from "Cocoa"`,
    String.raw`export { default } from "Cocoa"`,
    String.raw`export { enum } from "Cocoa"`,
    String.raw`export { default as default } from "Cocoa"`,
    String.raw`export { enum as enum } from "Cocoa"`,
];

for (let entry of list) {
    checkModuleSyntax(entry + ` assert { }`);
    checkModuleSyntax(entry + ` assert { type: "json" }`);
    checkModuleSyntax(entry + ` assert { "type": "json" }`);
    checkModuleSyntax(entry + ` assert { "type": "json", }`);
    checkModuleSyntax(entry + ` assert { type: "json", hello: "world" }`);
}
