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

let typeCases = [
    "1",
    "Math.PI",
    "NaN",
    "undefined",
    "null",
    "true",
    "false",
];

let operators = ["<", "<=", ">", ">=", "==", "!=", "===", "!=="];

function opaqueSideEffect()
{
}
noInline(opaqueSideEffect);

let testCaseIndex = 0;
for (let operator of operators) {
    eval(`
        function testPolymorphic(a, b) {
            if (a ${operator} b) {
                opaqueSideEffect()
                return true;
            }
            return false;
        }
        noInline(testPolymorphic)`);

    for (let left of typeCases) {
        for (let right of typeCases) {
            let llintResult = eval(left + operator + right);
            eval(`
            function testMonomorphic${testCaseIndex}(a, b) {
                if (a ${operator} b) {
                    opaqueSideEffect()
                    return true;
                }
                return false;
            }
            noInline(testMonomorphic${testCaseIndex});

            function testMonomorphicLeftConstant${testCaseIndex}(b) {
                if (${left} ${operator} b) {
                    opaqueSideEffect()
                    return true;
                }
                return false;
            }
            noInline(testMonomorphicLeftConstant${testCaseIndex});

            function testMonomorphicRightConstant${testCaseIndex}(a) {
                if (a ${operator} ${right}) {
                    opaqueSideEffect()
                    return true;
                }
                return false;
            }
            noInline(testMonomorphicRightConstant${testCaseIndex});

            for (let i = 0; i < 500; ++i) {
                if (testMonomorphic${testCaseIndex}(${left}, ${right}) !== ${llintResult})
                    throw "Failed testMonomorphic${testCaseIndex}(${left}, ${right})";
                if (testMonomorphicLeftConstant${testCaseIndex}(${right}) !== ${llintResult})
                    throw "Failed testMonomorphicLeftConstant${testCaseIndex}(${right})";
                if (testMonomorphicRightConstant${testCaseIndex}(${left}) !== ${llintResult})
                    throw "Failed testMonomorphicLeftConstant${testCaseIndex}(${left})";
                if (testPolymorphic(${left}, ${right}) !== ${llintResult})
                    throw "Failed polymorphicVersion(${left}, ${operator}, ${right}, expected result: ${llintResult})";
            }
            `);
            ++testCaseIndex;
        }
    }
}
