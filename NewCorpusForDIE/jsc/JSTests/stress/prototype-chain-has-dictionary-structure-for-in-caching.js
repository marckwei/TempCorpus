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


function assert(b) {
    if (!b)
        throw new Error("Bad")
}

var Test = function(){};

let methodNumber = 0;
function addMethods() {
    const methodCount = 65;
    for (var i = 0; i < methodCount; i++){
        Test.prototype['myMethod' + i + methodNumber] = function(){};
        ++methodNumber;
    }
}

addMethods();

var test1 = new Test();

for (var k in test1) { }

let test2 = new Test();

for (let i = 0; i < 100; ++i ) {
    let propName = 'myAdditionalMethod' + i;
    Test.prototype[propName] = function(){};
    let foundNewPrototypeProperty = false;
    for (let k in test2) {
        if (propName === k)
            foundNewPrototypeProperty = true;
    }
    assert(foundNewPrototypeProperty);
    addMethods();
}
