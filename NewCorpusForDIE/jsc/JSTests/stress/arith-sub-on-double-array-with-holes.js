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

let testCases = [
    // Numbers
    ['1', 0, 0],
    ['1.5', 1 - 1.5, 1.5 - 1],
    [NaN, NaN, NaN],

    // Strings.
    ['""', 1, -1],
    ['new String()', 1, -1],
    ['"WebKit!"', NaN, NaN],

    // Objects.
    ['{ }', NaN, NaN],
    ['{ foo: 1 }', NaN, NaN],
    ['{ toString: function() { return ""; } }', 1, -1],
    ['{ toString: function() { return "WebKit"; } }', NaN, NaN],

    // Others.
    ['null', 1, -1],
    ['undefined', NaN, NaN]
];

for (let testCase of testCases) {
    let otherOperand = testCase[0];
    let expectedLeftValue = testCase[1];
    let expectedRightValue = testCase[2];
    eval(
        `// Those holes are not observable by arithmetic operation.
        // The return value is always going to be NaN.
        function nonObservableHoleOnLhs(array, otherValue) {
            return array[0] - otherValue;
        }
        noInline(nonObservableHoleOnLhs);

        function observableHoleOnLhs(array, otherValue) {
            let value = array[0];
            return [value - otherValue, value];
        }
        noInline(observableHoleOnLhs);

        function nonObservableHoleOnRhs(array, otherValue) {
            return otherValue - array[0];
        }
        noInline(nonObservableHoleOnRhs);

        function observableHoleOnRhs(array, otherValue) {
            let value = array[0];
            return [otherValue - value, value];
        }
        noInline(observableHoleOnRhs);

        let testArray = new Array;
        for (let i = 1; i < 3; ++i) {
            testArray[i] = i + 0.5
        }

        for (let i = 0; i < 1e4; ++i) {
            let lhsResult1 = nonObservableHoleOnLhs(testArray, ${otherOperand});
            if (lhsResult1 == lhsResult1)
                throw "Error on nonObservableHoleOnLhs at i = " + i;
            let lhsResult2 = observableHoleOnLhs(testArray, ${otherOperand});
            if (lhsResult2[0] == lhsResult2[0] || lhsResult2[1] !== undefined)
                throw "Error on observableHoleOnLhs at i = " + i;

            let rhsResult1 = nonObservableHoleOnRhs(testArray, ${otherOperand});
            if (rhsResult1 == rhsResult1)
                throw "Error on nonObservableHoleOnRhs at i = " + i;
            let rhsResult2 = observableHoleOnRhs(testArray, ${otherOperand});
            if (rhsResult2[0] == rhsResult2[0] || rhsResult2[1] !== undefined)
                throw "Error on observableHoleOnRhs at i = " + i;
        }

        let isEqual = function(a, b) {
            if (a === a) {
                return a === b;
            }
            return b !== b;
        }

        // Fill the hole, make sure everything still work correctly.
        testArray[0] = 1.;
        for (let i = 0; i < 1e4; ++i) {
            let lhsResult1 = nonObservableHoleOnLhs(testArray, ${otherOperand});
            if (!isEqual(lhsResult1, ${expectedLeftValue}))
                throw "Error on non hole nonObservableHoleOnLhs at i = " + i + " expected " + ${expectedLeftValue} + " got " + lhsResult1;
            let lhsResult2 = observableHoleOnLhs(testArray, ${otherOperand});
            if (!isEqual(lhsResult2[0], ${expectedLeftValue}) || lhsResult2[1] !== 1)
                throw "Error on non hole observableHoleOnLhs at i = " + i + " expected " + ${expectedLeftValue} + " got " + lhsResult2[0];

            let rhsResult1 = nonObservableHoleOnRhs(testArray, ${otherOperand});
            if (!isEqual(rhsResult1, ${expectedRightValue}))
                throw "Error on non hole nonObservableHoleOnRhs at i = " + i + " expected " + ${expectedRightValue} + " got " + rhsResult1;
            let rhsResult2 = observableHoleOnRhs(testArray, ${otherOperand});
            if (!isEqual(rhsResult2[0], ${expectedRightValue}) || rhsResult2[1] !== 1)
                throw "Error on non hole observableHoleOnRhs at i = " + i;
        }`
    );
}