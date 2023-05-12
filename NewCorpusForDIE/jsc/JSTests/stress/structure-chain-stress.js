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

var counter = 0;
function keys(a, b, c) {
    for (var i in a) {
        for (var j in b) {
            for (var k in c) {
            }
        }
    }
    if ((++counter) % 1000 === 0)
        gc();
}
noInline(keys);

var dictionary = {
    0: 2,
    "Hey": "Hello",
    "World": 32.4,
    "deleted": 20,
};
delete dictionary["deleted"];
for (var i = 0; i < 1e4; ++i) {
    keys([], [20], ["Hey"]);
    keys(["OK", 30], { Hello: 0, World: 2 }, []);
    keys(["OK", 30], { Hello: 0, World: 2 }, [42]);
    keys(["OK", 30], [], { Hello: 0, World: 2 });
    keys(["OK", 30], [2.5, 3.7], dictionary);
    keys(dictionary, { Hello: 0, World: 2 }, dictionary);
    keys({ Hello: 0, World: 2 }, dictionary, { Hello: 0, World: 2, 3:42 });
    keys({ [`hello${i}`]: i }, { [`hello${i}`]: i, [`world${i}`]: i  }, [ 42 ]);
}
