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

function doesThrow() {
    try {
        1 in ""
        return false
    } catch(v45) {
        return true
    }
}
noInline(doesThrow)
noFTL(doesThrow)

function doesThrowFTL() {
    try {
        1 in ""
        return false
    } catch(v45) {
        return true
    }
}
noInline(doesThrowFTL)

function blackbox() {
    return { }
}
noInline(blackbox)

function doesNotThrow() {
    try {
        1 in blackbox()
        return false
    } catch(v45) {
        return true
    }
}
noInline(doesNotThrow)
noFTL(doesNotThrow)

function trickster(o) {
    try {
        1 in o
        return false
    } catch(v45) {
        return true
    }
}
noInline(trickster)

// Does not throw
function enumeratorTest(o) {
    let sum = 0
    for (let i in o)
        sum += o[i]
    return sum
}
noInline(enumeratorTest)
noInline(enumeratorTest)

let indexedObject = []
indexedObject.length = 10
indexedObject.fill(1)

function main() {
    for (let j = 0; j < 50000; j++) {
        if (!doesThrow())
            throw new Error("Should throw!")
        if (!doesThrowFTL())
            throw new Error("Should throw!")
        if (doesNotThrow())
            throw new Error("Should not throw!")
        
            let o = {}
        o["a" + j] = 0
        if (trickster(o))
            throw new Error("Should not throw!")
        
        enumeratorTest(indexedObject)
    }
    if (!trickster(""))
        throw new Error("Should throw!")
    enumeratorTest("")
}
noDFG(main)
noFTL(main)
noInline(main)
main()