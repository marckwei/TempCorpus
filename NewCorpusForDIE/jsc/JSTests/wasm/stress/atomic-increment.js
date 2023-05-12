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

//@ skip if $architecture != "arm64" && $architecture != "x86_64"
import * as assert from '../assert.js';

const num = 3;
const count = 1e5;

let memory = new WebAssembly.Memory({
    initial: 1,
    maximum: 1,
    shared: true
});
let buffer = new Int32Array(memory.buffer);

for (let i = 0; i < num; ++i) {
    $.agent.start(`
        import("../wabt-wrapper.js").then(({ instantiate }) => {
            $262.agent.receiveBroadcast(function(memory) {
                $262.agent.sleep(1);
                (async function () {
                    let wat = \`
                        (module
                            (memory (import "env" "memory") 1 1 shared)
                            (func (export "add") (result i32) (i32.atomic.rmw.add (i32.const 0) (i32.const 1)))
                        )\`;
                    let instance = await instantiate(wat, {
                        env: { memory }
                    }, { threads: true });
                    for (var i = 0; i < ${count}; ++i)
                        instance.exports.add();
                    $262.agent.report(0);
                    $262.agent.leaving();
                })();
            });
        }, (error) => { print(error); });
    `, import.meta.filename);
}

$262.agent.broadcast(memory);
let done = 0;
while (true) {
    let report = $262.agent.getReport();
    if (report !== null)
        done++;
    if (done === num)
        break;
    $262.agent.sleep(1);
}
assert.eq(buffer[0], count * num);
