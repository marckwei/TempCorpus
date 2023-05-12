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

const TOTAL_WAITER_COUNT = 10;
const WAIT_INDEX = TOTAL_WAITER_COUNT * 2 - 1;

var sab = new SharedArrayBuffer(TOTAL_WAITER_COUNT * 2 * 4);
var i32a = new Int32Array(sab);

var numWorkers = 0;
function startWorker(code) {
    numWorkers++;
    $.agent.start(code);
}

Atomics.store(i32a, 0, 1);
for (let i = 0; i < TOTAL_WAITER_COUNT; i++) {
    startWorker(`
        $.agent.receiveBroadcast(async (sab) => {
            var i32a = new Int32Array(sab);

            Atomics.wait(i32a, ${i}, 0);

            let p = Atomics.waitAsync(i32a, ${WAIT_INDEX}, 0).value;

            Atomics.store(i32a, ${i + 1}, 1);
            Atomics.notify(i32a, ${i + 1});

            let res = await p;
            if (res !== 'ok')
                throw new Error("AsyncWaiter ${i} resolve: " + res);

            $.agent.report("AsyncWaiter ${i} done");
        });
    `);
}

$.agent.broadcast(sab);

while (waiterListSize(i32a, WAIT_INDEX) != TOTAL_WAITER_COUNT);

let reports = [];
for (let i = 0; i < TOTAL_WAITER_COUNT; i++) {
    Atomics.notify(i32a, WAIT_INDEX, 1);
    reports.push(waitForReport());
}

let expected = [];
for (let i = 0; i < TOTAL_WAITER_COUNT; i++) {
    expected.push(`AsyncWaiter ${i} done`);
}

function assert(actual, expected) {
    let size = actual.length;
    for (let i = 0; i < size; i++)
        if (actual[i] != expected[i])
            throw new Error(`Error: actual[${i}]=${actual[i]} but expected[${i}]=${expected[i]}`);
}

assert(reports, expected);

if (waiterListSize(i32a, WAIT_INDEX) != 0)
    throw new Error("The WaiterList should be empty.");
