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

//@ runDefault("--maxPerThreadStackUsage=1572864", "--forceMiniVMMode=1", "--stealEmptyBlocksFromOtherAllocators=0", "--collectContinuously=1", "--watchdog=3000", "--watchdog-exception-ok")
// Reproducing the crash with this test is very hard. You should execute something like this.
// while true; do for x in {0..4}; do DYLD_FRAMEWORK_PATH=$VM $VM/jsc --maxPerThreadStackUsage=1572864 --forceMiniVMMode=1 --stealEmptyBlocksFromOtherAllocators=0 --collectContinuously=1 collect-continuously-should-not-wake-concurrent-collector-after-prevent-collection-is-called.js --watchdog=3000&; done; wait; sleep 0.1; done

array = [];
for (var i = 0; i < 800; ++i) {
  array[i] = new DataView(new ArrayBuffer());
}

let theCode = `
for (let j = 0; j < 100; j++) {
  generateHeapSnapshotForGCDebugging();
}
`

for (let i=0; i<5; i++) {
  $.agent.start(theCode);
}

for (let i=0; i<3; i++) {
  runString(theCode);
}
