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

var sortedValues;

var testCase = function (actual, expected, message) {
  if (actual !== expected) {
    throw message + ". Expected '" + expected + "', but was '" + actual + "'";
  }
};


var obj = {
  arr: [1, 4, 6, 3, 7, 0],
  bubbleSort: function () {
    return () => {
      var tmp;
      var ar = this.arr.slice();
      var _length = ar.length
      for (var i = 0; i < _length; i++) {
        for (var j = i; j > 0; j--) {
          if ((ar[j] - ar[j - 1]) < 0) {
            tmp = ar[j];
            ar[j] = ar[j - 1];
            ar[j - 1] = tmp;
          }
        }
      }
      return ar;
    }
  }
};

noInline(obj.bubbleSort);

for (var i=0; i<10000; i++) {
    obj.arr = [1, 2, 4, 6, 3, 7, 0];
    testCase(obj.bubbleSort()().length, 7, "Error: this is not lexically binded inside of the arrow function #1");

    var sortedValues = obj.bubbleSort()();
    testCase(sortedValues[0], 0, "Error: this is not lexically binded inside of the arrow function #6");
    testCase(sortedValues[6], 7, "Error: this is not lexically binded inside of the arrow function #7");

    obj.arr = [1, 2, 4, 6, 5, 8, 21, 19, 0];

    testCase(obj.bubbleSort()().length, 9, "Error: this is not lexically binded inside of the arrow function #8");

    sortedValues = obj.bubbleSort()();
    testCase(sortedValues[1], 1, "Error: this is not lexically binded inside of the arrow function #12");
    testCase(sortedValues[8], 21, "Error: this is not lexically binded inside of the arrow function #13");
}
