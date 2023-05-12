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

function testArray(arrayType)
{
    var testCode =
        `
        function testOutOfBoundsValues(regularArray, typedArray) {
            for (var i = 0; i < 16; ++i) {
                var typedArrayValue = typedArray[i]
                if (typedArrayValue !== BigInt(i)) {
                    throw "Failed ${ arrayType }AndObjectSpeculationInBounds, typedArrayValue = " + typedArrayValue + " for i = " + i;
                }
                var regularArrayValue = regularArray[i];
                if (regularArrayValue !== BigInt(i)) {
                    throw "Failed ${ arrayType }AndObjectSpeculationInBounds, regularArrayValue = " + regularArrayValue + " for i = " + i;
                }
            }
            for (var i = 16; i < 24; ++i) {
                var typedArrayValue = typedArray[i]
                if (typedArrayValue !== undefined) {
                    throw "Failed ${ arrayType }AndObjectSpeculationInBounds, typedArrayValue = " + typedArrayValue + " for i = " + i;
                }
                var regularArrayValue = regularArray[i];
                if (regularArrayValue !== BigInt(i)) {
                    throw "Failed ${ arrayType }AndObjectSpeculationInBounds, regularArrayValue = " + regularArrayValue + " for i = " + i;
                }
            }
        }

        // We make this look like a polymorphic types for incomingObject but the GetByVal are never actually
        // polymorphic. The boolean isTypedArray let us differentiate the types.
        function ${ arrayType }AndObjectSpeculationInBounds(incomingObject, iterationLength, isTypedArray) {
            if (isTypedArray) {
                for (var i = 0; i < iterationLength; ++i) {
                    incomingObject[i] = BigInt(i);
                }
            } else {
                for (var i = 0; i < iterationLength; ++i) {
                    incomingObject[i] = BigInt(i);
                }
            }
        }
        noInline(${ arrayType }AndObjectSpeculationInBounds);

        var typedArray = new ${ arrayType }(16);
        var regularArray = new Array(16);

        // Access in bounds.
        for (var i = 0; i < 1e4; ++i) {
            ${ arrayType }AndObjectSpeculationInBounds(regularArray, 16, false);
            ${ arrayType }AndObjectSpeculationInBounds(typedArray, 16, true);
        }
        for (var i = 0; i < 16; ++i) {
            var typedArrayValue = typedArray[i]
            if (typedArrayValue !== BigInt(i)) {
                throw "Failed ${ arrayType }AndObjectSpeculationInBounds, typedArrayValue = " + typedArrayValue + " for i = " + i;
            }
            var regularArrayValue = regularArray[i];
            if (regularArrayValue !== BigInt(i)) {
                throw "Failed ${ arrayType }AndObjectSpeculationInBounds, regularArrayValue = " + regularArrayValue + " for i = " + i;
            }
        }

        // One "out of bounds" on top of the in bounds profile.
        ${ arrayType }AndObjectSpeculationInBounds(regularArray, 24, false);
        ${ arrayType }AndObjectSpeculationInBounds(typedArray, 24, true);
        testOutOfBoundsValues(regularArray, typedArray);

        // Same but here we make out-of-bounds a normal case.
        function ${ arrayType }AndObjectSpeculationOutOfBounds(incomingObject, iterationLength, isTypedArray) {
            if (isTypedArray) {
                for (var i = 0; i < iterationLength; ++i) {
                    incomingObject[i] = BigInt(i);
                }
            } else {
                for (var i = 0; i < iterationLength; ++i) {
                    incomingObject[i] = BigInt(i);
                }
            }
        }
        noInline(${ arrayType }AndObjectSpeculationOutOfBounds);

        var typedArray = new ${ arrayType }(16);
        var regularArray = new Array(16);
        for (var i = 0; i < 1e4; ++i) {
            ${ arrayType }AndObjectSpeculationInBounds(regularArray, 24, false);
            ${ arrayType }AndObjectSpeculationInBounds(typedArray, 24, true);
        }`
    eval(testCode);
}

testArray("BigInt64Array");
testArray("BigUint64Array");
