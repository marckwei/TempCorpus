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

function bench(string, func)
{
    for (var i = 0; i < 1000; ++i)
        func();
}
noInline(bench);

function forRepeatCount(count, pos, utf16) {
    var base = "lalalalala".repeat(count);
    if (utf16) {
        base += "ϧ"; // arbitrary utf-16
    }

    var input = base;
    var label;
    const charToFind = !utf16 ? "z" : String.fromCodePoint(0x0245);
    switch (pos) {
        case -1: {
            input = charToFind + base;
            label = `beg ${utf16 ? "UChar" : "LChar"}`;
            break;
        }
        case 0: {
            label = `mid ${utf16 ? "UChar" : "LChar"}`;
            input =
            base.substring(0, (base.length / 2) | 0) +
            charToFind +
            base.substring((base.length / 2) | 0);
            break;
        }
        case 1: {
            label = `end ${utf16 ? "UChar" : "LChar"}`;
            input = base + charToFind;
            break;
        }
            // not found
        case 2: {
            label = `404 ${utf16 ? "UChar" : "LChar"}`;
            break;
        }
    }

    // force it to not be a rope
    input = input.split("").join("");

    function target() {
        input.indexOf(charToFind)
    }
    noInline(target);
    return bench(
        `<${label}> [${new Intl.NumberFormat()
                .format(input.length)
                .padStart("10,000,001".length)} chars] indexOf`,
        target
    );
}

function all(utf16) {
    forRepeatCount(100, 2, !!utf16);
}
all(true);
