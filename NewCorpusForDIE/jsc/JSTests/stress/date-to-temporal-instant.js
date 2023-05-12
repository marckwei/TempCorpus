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

//@ requireOptions("--useTemporal=1")

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error(`expected ${expected} but got ${actual}`);
}

function shouldThrow(func, errorType, message) {
    let error;
    try {
        func();
    } catch (e) {
        error = e;
    }

    if (!(error instanceof errorType))
        throw new Error(`Expected ${errorType.name}!`);
    if (message !== undefined) {
        if (Object.prototype.toString.call(message) === '[object RegExp]') {
            if (!message.test(String(error)))
                throw new Error(`expected '${String(error)}' to match ${message}!`);
        } else {
            shouldBe(String(error), message);
        }
    }
}


// Invalid Date

{
    const date = new Date(NaN);
    shouldThrow(() => {date.toTemporalInstant()}, RangeError)
}

// Epoch 
{
    const epochDateInstant = new Date(0).toTemporalInstant();
    const epochInstant = new Temporal.Instant(0n);
    shouldBe(epochDateInstant.toString(), epochInstant.toString());
    shouldBe(epochDateInstant.epochNanoseconds, epochInstant.epochNanoseconds);
    
    shouldBe(epochDateInstant.epochSeconds, 0);
    shouldBe(epochDateInstant.epochMilliseconds, 0);
    shouldBe(epochDateInstant.epochMicroseconds, 0n);
    shouldBe(epochDateInstant.epochNanoseconds, 0n);

}

// Positive value: 10^18
{
    const dateToInstant = new Date(1_000_000_000_000).toTemporalInstant();
    const temporalInstant = new Temporal.Instant(1_000_000_000_000_000_000n);
    shouldBe(dateToInstant.toString(), temporalInstant.toString());
    shouldBe(dateToInstant.epochNanoseconds, temporalInstant.epochNanoseconds);
    
    shouldBe(dateToInstant.epochSeconds, 1_000_000_000);
    shouldBe(dateToInstant.epochMilliseconds, 1_000_000_000_000);
    shouldBe(dateToInstant.epochMicroseconds, 1_000_000_000_000_000n);
    shouldBe(dateToInstant.epochNanoseconds, 1_000_000_000_000_000_000n);
}

// Negative value: -10^18
{
    const dateToInstant = new Date(-1_000_000_000_000).toTemporalInstant();
    const temporalInstant = new Temporal.Instant(-1_000_000_000_000_000_000n);
    shouldBe(dateToInstant.toString(), temporalInstant.toString());
    shouldBe(dateToInstant.epochNanoseconds, temporalInstant.epochNanoseconds);

    shouldBe(dateToInstant.epochSeconds, -1_000_000_000);
    shouldBe(dateToInstant.epochMilliseconds, -1_000_000_000_000);
    shouldBe(dateToInstant.epochMicroseconds, -1_000_000_000_000_000n);
    shouldBe(dateToInstant.epochNanoseconds, -1_000_000_000_000_000_000n);
}

// Max instant
{
    const dateToInstant = new Date(86400_0000_0000_000).toTemporalInstant();
    const temporalInstant = new Temporal.Instant(86400_0000_0000_000_000_000n);
    shouldBe(dateToInstant.toString(), temporalInstant.toString());
    shouldBe(dateToInstant.epochNanoseconds, temporalInstant.epochNanoseconds);
    
    shouldBe(dateToInstant.epochSeconds, 86400_0000_0000);
    shouldBe(dateToInstant.epochMilliseconds, 86400_0000_0000_000);
    shouldBe(dateToInstant.epochMicroseconds, 86400_0000_0000_000_000n);
    shouldBe(dateToInstant.epochNanoseconds, 86400_0000_0000_000_000_000n);
}

//Min instant
{
    const dateToInstant = new Date(-86400_0000_0000_000).toTemporalInstant();
    const temporalInstant = new Temporal.Instant(-86400_0000_0000_000_000_000n);
    shouldBe(dateToInstant.toString(), temporalInstant.toString());
    shouldBe(dateToInstant.epochNanoseconds, temporalInstant.epochNanoseconds);
    
    shouldBe(dateToInstant.epochSeconds, -86400_0000_0000);
    shouldBe(dateToInstant.epochMilliseconds, -86400_0000_0000_000);
    shouldBe(dateToInstant.epochMicroseconds, -86400_0000_0000_000_000n);
    shouldBe(dateToInstant.epochNanoseconds, -86400_0000_0000_000_000_000n);
}