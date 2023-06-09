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

function testSyntax(script) {
    try {
        eval(script);
    } catch (error) {
        if (error instanceof SyntaxError)
            throw new Error("Bad error: " + String(error));
    }
}

function testSyntaxError(script, message) {
    var error = null;
    try {
        eval(script);
    } catch (e) {
        error = e;
    }
    if (!error)
        throw new Error("Expected syntax error not thrown");

    if (String(error) !== message)
        throw new Error("Bad error: " + String(error));
}

testSyntax(`
function t1() {
    var yield = 20;
}
`);
testSyntax(`
function t1() {
    let yield = 20;
}
`);
testSyntax(`
function t1() {
    const yield = 20;
}
`);

testSyntaxError(`
function t1() {
    "use strict";
    var yield = 20;
}
`, `SyntaxError: Cannot use 'yield' as a variable name in strict mode.`);
testSyntaxError(`
function t1() {
    "use strict";
    let yield = 20;
}
`, `SyntaxError: Cannot use 'yield' as a lexical variable name in strict mode.`);
testSyntaxError(`
function t1() {
    "use strict";
    const yield = 20;
}
`, `SyntaxError: Cannot use 'yield' as a lexical variable name in strict mode.`);

testSyntax(`
function t1() {
    var { yield } = 20;
}
`);
testSyntax(`
function t1() {
    let { yield } = 20;
}
`);
testSyntax(`
function t1() {
    const { yield } = 20;
}
`);

testSyntaxError(`
function t1() {
    "use strict";
    var { yield } = 20;
}
`, `SyntaxError: Cannot use abbreviated destructuring syntax for keyword 'yield'.`);
testSyntaxError(`
function t1() {
    "use strict";
    let { yield } = 20;
}
`, `SyntaxError: Cannot use abbreviated destructuring syntax for keyword 'yield'.`);
testSyntaxError(`
function t1() {
    "use strict";
    const { yield } = 20;
}
`, `SyntaxError: Cannot use abbreviated destructuring syntax for keyword 'yield'.`);

testSyntax(`
function t1() {
    var { i: yield } = 20;
}
`);
testSyntax(`
function t1() {
    let { i: yield } = 20;
}
`);
testSyntax(`
function t1() {
    const { i: yield } = 20;
}
`);

testSyntaxError(`
function t1() {
    "use strict";
    var { i: yield } = 20;
}
`, `SyntaxError: Cannot use 'yield' as a variable name in strict mode.`);
testSyntaxError(`
function t1() {
    "use strict";
    let { i: yield } = 20;
}
`, `SyntaxError: Cannot use 'yield' as a lexical variable name in strict mode.`);
testSyntaxError(`
function t1() {
    "use strict";
    const { i: yield } = 20;
}
`, `SyntaxError: Cannot use 'yield' as a lexical variable name in strict mode.`);

testSyntax(`
function t1() {
    var [ yield ] = 20;
}
`);
testSyntax(`
function t1() {
    let [ yield ] = 20;
}
`);
testSyntax(`
function t1() {
    const [ yield ] = 20;
}
`);

testSyntaxError(`
function t1() {
    "use strict";
    var [ yield ] = 20;
}
`, `SyntaxError: Cannot use 'yield' as a variable name in strict mode.`);
testSyntaxError(`
function t1() {
    "use strict";
    let [ yield ] = 20;
}
`, `SyntaxError: Cannot use 'yield' as a lexical variable name in strict mode.`);
testSyntaxError(`
function t1() {
    "use strict";
    const [ yield ] = 20;
}
`, `SyntaxError: Cannot use 'yield' as a lexical variable name in strict mode.`);

testSyntax(`
function t1() {
    function yield() { }
}
`);
testSyntaxError(`
function t1() {
    "use strict";
    function yield() { }
}
`, `SyntaxError: Cannot use 'yield' as a function name in strict mode.`);

testSyntax(`
function t1() {
    try {
    } catch (yield) {
    }
}
`);
testSyntaxError(`
function t1() {
    "use strict";
    try {
    } catch (yield) {
    }
}
`, `SyntaxError: Cannot use 'yield' as a catch parameter name in strict mode.`);

testSyntax(`
function t1() {
    function yield() {
        "use strict";
    }
}
`);
