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

var masquerader = makeMasquerader();

var test1 = (arg = 1) => arg;
noInline(test1);
for (var i = 0; i < 1e5; ++i)
    shouldBe(test1(masquerader), masquerader);

var test2 = obj => { var {key = 2} = obj; return key; };
noInline(test2);
for (var i = 0; i < 1e5; ++i) {
    shouldBe(test2({key: masquerader}), masquerader);

    var {key = 2} = {key: masquerader};
    shouldBe(key, masquerader);
}

var test3 = arr => { var [item = 3] = arr; return item; };
noInline(test3);
for (var i = 0; i < 1e5; ++i) {
    shouldBe(test3([masquerader]), masquerader);

    var [item = 3] = [masquerader];
    shouldBe(item, masquerader);
}
