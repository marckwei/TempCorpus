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
yield;
`);

testSyntaxError(`
yield*;
`, "SyntaxError: Unexpected token ';'");

testSyntaxError(`
yield 0;
`, "SyntaxError: Unexpected number '0'");

testSyntax(`
yield* 0;
`);

testSyntax(`
function hello() {
    yield;
}
`);

testSyntaxError(`
function hello() {
    yield*;
}
`, "SyntaxError: Unexpected token ';'");

testSyntaxError(`
function hello() {
    yield 0;
}
`, "SyntaxError: Unexpected number '0'");

testSyntax(`
function hello() {
    yield* 0;
}
`);

testSyntax(`
function *gen() {
    function hello() {
        yield;
    }
}
`);

testSyntaxError(`
function *gen() {
    function hello() {
        yield*;
    }
}
`, "SyntaxError: Unexpected token ';'");

testSyntaxError(`
function *gen() {
    function hello() {
        yield 0;
    }
}
`, "SyntaxError: Unexpected number '0'");

testSyntax(`
function *gen() {
    function hello() {
        yield* 0;
    }
}
`);

testSyntax(`
function *gen() {
    yield;
}
`);

testSyntaxError(`
function *gen() {
    yield*;
}
`, "SyntaxError: Unexpected token '*'");

testSyntax(`
function *gen() {
    yield 0;
}
`);

testSyntax(`
function *gen() {
    yield* 0;
}
`);

testSyntax(`
function *gen() {
    {
        let i = 30;
        function ok() {
            return i;
        }
        yield;
    }
}
`);

testSyntaxError(`
function *gen() {
    {
        let i = 30;
        function ok() {
            return i;
        }
        yield*;
    }
}
`, "SyntaxError: Unexpected token '*'");

testSyntax(`
function *gen() {
    {
        let i = 30;
        function ok() {
            return i;
        }
        yield 0;
    }
}
`);

testSyntax(`
function *gen() {
    {
        let i = 30;
        function ok() {
            return i;
        }
        yield* 0;
    }
}
`);
