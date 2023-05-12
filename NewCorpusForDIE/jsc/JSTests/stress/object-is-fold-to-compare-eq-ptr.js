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

function main() {
const v3 = [1337,1337,13.37,1337];
const v5 = [1337,13.37,1337,1337,1337,1337,13.37,1337,1337,1337];
const v8 = {getInt8:13.37};
const v9 = Object();
function v10(v11,v12,v13,v14) {
    for (const v15 of v5) {
        for (const v16 of v11) {
            let v18 = v8;
            do {
                const v20 = Object.is(0,v18);
                const v22 = ["name"];
                for (let v25 = 0; v25 < 100; v25++) {
                    const v26 = v25[100];
                }
                const v27 = v22 + 1;
                v18 = v27;
            } while (v18 < -9007199254740991);
        }
    }
}
const v28 = v10(v3,v9);
}
noDFG(main);
noFTL(main);
main();
