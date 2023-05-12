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

description(
"This tests that throwing from a finally block has the expected effect."
);

var events = [];

try {
    events.push("1:try");
} finally {
    events.push("1:finally");
}

try {
    try {
        throw "2:thingy";
    } finally {
        events.push("2:finally");
    }
} catch (e) {
    events.push(e);
}

try {
    throw "3:thingy";
} catch (e) {
    events.push(e);
} finally {
    events.push("3:finally");
}

try {
    try {
        throw "4:thingy";
    } catch (e) {
        events.push(e);
    } finally {
        events.push("4:finally");
        throw "4:another thingy";
    }
} catch (e) {
    events.push(e);
}

try {
    for (;;) {
        try {
            continue;
        } finally {
            events.push("5:hi");
            throw "5:wat";
        }
    }
} catch (e) {
    events.push(e);
}

shouldBe("\"\" + events", "\"1:try,1:finally,2:finally,2:thingy,3:thingy,3:finally,4:thingy,4:finally,4:another thingy,5:hi,5:wat\"");

