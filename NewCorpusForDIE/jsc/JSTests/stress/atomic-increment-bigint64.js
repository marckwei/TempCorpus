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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

const num = 3;
const count = 1e5;

let buffer = new SharedArrayBuffer(128);
let array = new BigInt64Array(buffer);

for (let i = 0; i < num; ++i) {
    $.agent.start(`
        $262.agent.receiveBroadcast(function(buffer) {
            let array = new BigInt64Array(buffer);
            $262.agent.sleep(1);
            for (var i = 0; i < ${count}; ++i)
                Atomics.add(array, 0, 1n);
            $262.agent.report(0);
            $262.agent.leaving();
        });
    `);
}

$262.agent.broadcast(buffer);
let done = 0;
while (true) {
    let report = $262.agent.getReport();
    if (report !== null)
        done++;
    if (done === num)
        break;
    $262.agent.sleep(1);
}
shouldBe(array[0], BigInt(count * num));
