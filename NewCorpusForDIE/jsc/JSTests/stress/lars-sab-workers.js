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

//@ defaultRunNoisyTest
var sab = new SharedArrayBuffer(100 * 4);

var memory = new Int32Array(sab);

var numWorkers = 0;
function startWorker(code)
{
    print("Starting worker!");
    
    numWorkers++;
    $.agent.start(code);
}

resources = `
function wait(memory, index, waitCondition, notifyCondition)
{
    while (memory[index] == waitCondition) {
        var result = Atomics.wait(memory, index, waitCondition);
        switch (result) {
        case "not-equal":
        case "ok":
            break;
        default:
            $.agent.report("Error: bad result from wait: " + result);
            $.agent.report("error");
            break;
        }
        var value = memory[index];
        if (value != notifyCondition) {
            $.agent.report("Error: wait returned not-equal but the memory has a bad value: " + value);
            $.agent.report("error");
        }
    }
    var value = memory[index];
    if (value != notifyCondition) {
        $.agent.report("Error: done waiting but the memory has a bad value: " + value);
        $.agent.report("error");
    }
}

function notify(memory, index)
{
    var result = Atomics.notify(memory, index, 1);
    if (result != 0 && result != 1) {
        $.agent.report("Error: bad result from notify: " + result);
        $.agent.report("error");
    }
}
`;

startWorker(
    resources + `
    $.agent.receiveBroadcast(sab => {
        var memory = new Int32Array(sab);
        var didStartIdx = 0;
        var shouldGoIdx = 1;
        var didEndIdx = 2;
        
        $.agent.report("1: Started!");
        $.agent.report("1: Memory: " + memory);
        
        wait(memory, didStartIdx, 0, 1);
        
        $.agent.report("1: It started!");
        
        memory[shouldGoIdx] = 1;
        notify(memory, shouldGoIdx);
        
        wait(memory, didEndIdx, 0, 1);
        
        $.agent.report("1: All done!");
        $.agent.report("1: Memory: " + memory);
        $.agent.report("done");
    });
    `);

startWorker(
    resources + `
    $.agent.receiveBroadcast(sab => {
        var memory = new Int32Array(sab);
        var didStartIdx = 0;
        var shouldGoIdx = 1;
        var didEndIdx = 2;
        
        $.agent.report("2: Started!");
        $.agent.report("2: Memory: " + memory);
        
        Atomics.store(memory, didStartIdx, 1);
        notify(memory, didStartIdx);
        
        wait(memory, shouldGoIdx, 0, 1);
        
        Atomics.store(memory, didEndIdx, 1);
        notify(memory, didEndIdx, 1);
        
        $.agent.report("2: Memory: " + memory);
        $.agent.report("done");
    });
    `);

$.agent.broadcast(sab);

for (;;) {
    var report = waitForReport();
    if (report == "done") {
        if (!--numWorkers) {
            // print("All workers done!");
            break;
        }
    } else if (report == "error") {
        print("Test failed!");
        throw new Error("Test failed.");
    } else
        print("report: " + report);
}

for (var i = 0; i < 3; ++i) {
    if (memory[i] != 1)
        throw "Error: Bad value at memory[" + i + "]: " + memory[i];
}
for (var i = 3; i < memory.length; ++i) {
    if (memory[i] != 0)
        throw "Error: Bad value at memory[" + i + "]: " + memory[i];
}
print("Test passed!");
