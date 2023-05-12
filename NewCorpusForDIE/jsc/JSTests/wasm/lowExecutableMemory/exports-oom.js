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

// FIXME: Consider making jump islands work with Options::jitMemoryReservationSize
// https://bugs.webkit.org/show_bug.cgi?id=209037
//@ skip

import * as assert from '../assert.js'
import Builder from '../Builder.js'

const verbose = false;
const numFunctions = 2;
const maxParams = 128;

// This test starts running with a few bytes of executable memory available. Try
// to create and instantiate modules which have way more exports than anything
// else. Hopefully they'll fail when trying to instantiate their entrypoints.

const type = () => {
    const types = ["i32", "f32", "f64"]; // Can't export i64.
    return types[(Math.random() * types.length) | 0];
};

const params = () => {
    let p = [];
    let count = (Math.random() * maxParams) | 0;
    while (count--)
        p.push(type());
    return p;
};

const randomProgram = () => {
    let b = new Builder()
        .Type().End()
        .Function().End()
        .Export();
    for (let f = 0; f < numFunctions; ++f)
        b = b.Function(`f${f}`);
    b = b.End().Code();
    for (let f = 0; f < numFunctions; ++f)
        b = b.Function(`f${f}`, { params: params() }).Return().End();
    b = b.End();
    return b.WebAssembly().get();
}

let failCount = 0;
let callCount = 0;
let instances = [];

const invoke = instance => {
    let result = 0;
    for (let f = 0; f < numFunctions; ++f) {
        const name = `f${f}`;
        if (verbose)
            print(`Invoking ${name}`);
        result += instance.exports[name]();
        ++callCount;
    }
    return result;
};

while (failCount === 0) {
    if (verbose)
        print(`Trying...`);

    const buf = randomProgram();
    let module;

    try {
        module = new WebAssembly.Module(buf);
    } catch (e) {
        if (e instanceof WebAssembly.CompileError) {
            if (verbose)
                print(`Caught: ${e}`);
            ++failCount;
        }
        else
            throw new Error(`Expected a WebAssembly.CompileError, got ${e}`);
    }

    if (module !== undefined) {
        if (verbose)
            print(`Creating instance`);

        let instance;
        try {
            instance = new WebAssembly.Instance(module);
        } catch (e) {
            if (e instanceof WebAssembly.LinkError) {
                if (verbose)
                    print(`Caught: ${e}`);
                ++failCount;
            }
            else
                throw new Error(`Expected a WebAssembly.LinkError, got ${e}`);
        }

        if (instance !== undefined) {
            instances.push(instance);
            invoke(instance);
        }
    }
}

if (callCount === 0)
    throw new Error(`Expected to be able to allocate a WebAssembly module, instantiate it, and call its exports at least once`);

// Make sure we can still call all the instances we create, even after going OOM.

if (verbose)
    print(`Invoking all previously created instances`);

for (let instance of instances)
    invoke(instance);
