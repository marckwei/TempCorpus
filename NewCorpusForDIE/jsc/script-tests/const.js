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

description(
"This test checks that const declarations in JavaScript work and are readonly."
);

function shouldThrowInvalidConstAssignment(f) {
    var threw = false;
    try {
        f();
    } catch(e) {
        if (e.name.indexOf("TypeError") !== -1 && e.message.indexOf("readonly") !== -1)
            threw = true;
    }
    if (threw)
        testPassed("function threw exception: '" + f.toString() + "'");
    else
        testFailed("function did not throw: '" + f.toString() + "'");
}
function assert(b) {
    if (!b)
        testFailed("Invalid assertion.")
    else
        testPassed("Assertion passed.");
}


shouldThrow("const redef='a'; const redef='a';");

const x = "RIGHT";
shouldThrowInvalidConstAssignment(function() { x = "WRONG"; });
assert(x === "RIGHT");


const z = "RIGHT", y = "RIGHT";
shouldThrowInvalidConstAssignment(function() { y = "WRONG"; });
assert(y === "RIGHT");

const one = 1;

var a = null;

// PostIncResolveNode
shouldThrowInvalidConstAssignment(function() { a = one++; });
assert(a === null);
assert(one === 1);

// PostDecResolveNode
shouldThrowInvalidConstAssignment(function() { a = one--; });
assert(a === null);
assert(one === 1);

// PreIncResolveNode
shouldThrowInvalidConstAssignment(function() { a = ++one; });
assert(a === null);
assert(one === 1);

// PreDecResolveNode
shouldThrowInvalidConstAssignment(function() { a = --one; });
assert(a === null);
assert(one === 1);

// ReadModifyConstNode
shouldThrowInvalidConstAssignment(function() { a = one += 2; });
assert(a === null);
assert(one === 1);

// AssignConstNode
shouldThrowInvalidConstAssignment(function() { a = one = 2; });
assert(a === null);
assert(one === 1);

// PostIncResolveNode
shouldThrow("function f() { const one = 1; one++; return one; } f();");
shouldThrow("function f() { const oneString = '1'; return oneString++; } f();");
shouldThrow("function f() { const one = 1; return one++; } f();");

// PostDecResolveNode
shouldThrow("function f() { const one = 1; one--; return one; } f();");
shouldThrow("function f() { const oneString = '1'; return oneString--; } f();");
shouldThrow("function f() { const one = 1; return one--; } f();");

// PreIncResolveNode
shouldThrow("function f() { const one = 1; ++one; return one; } f();");
shouldThrow("function f() { const one = 1; return ++one; } f();");

// PreDecResolveNode
shouldThrow("function f() { const one = 1; --one; return one; } f();");
shouldThrow("function f() { const one = 1; return --one; } f();");

// ReadModifyConstNode
shouldThrow("function f() { const one = 1; one += 2; return one; } f();");
shouldThrow("function f() { const one = 1; return one += 2; } f();");

// AssignConstNode
shouldThrow("function f() { const one = 1; one = 2; return one; } f();");
shouldThrow("function f() { const one = 1; return one = 2; } f();");

var object = { inWith1: "a", inWith2: "b"}
with (object) {
    const inWith1 = "hello";
    const inWith2 = "world";
    assert(inWith1 === "hello");
    assert(inWith2 === "world");
}
shouldBe("object.inWith1", "'a'");
shouldBe("object.inWith2", "'b'");

var f = function g() { g="FAIL"; return g; };
shouldBe("f()", "f");

// Make sure that dynamic scopes (catch, with) don't break const declarations
function tryCatch1() {
    var bar = null;
    eval("try {\
        stuff();\
    } catch (e) {\
        const bar = 5;\
    }");
    return bar;
}

function tryCatch2() {
    var bar = null;
    try {
        stuff();
    } catch (e) {
        const bar = 5;
    }
    return bar;
}

tryCatch1Result = tryCatch1();
shouldBe("tryCatch1Result", "null");
tryCatch2Result = tryCatch2();
shouldBe("tryCatch2Result", "null");

function with1() {
    var bar = null;
    eval("with({foo:42}) { const bar = 5; }");
    return bar;
}

function with2() {
    var bar = null;
    with({foo:42}) { const bar = 5; }
    return bar;
}

with1Result = with1();
shouldBe("with1Result", "null");
with2Result = with2();
shouldBe("with2Result", "null");

(function () {
    (function() {
        const x = "1";
        shouldThrowInvalidConstAssignment(function() { ++x; });
        assert(x === "1");
        shouldThrowInvalidConstAssignment(function() { x++; });
        assert(x === "1");
        shouldThrowInvalidConstAssignment(function() { x--; });
        assert(x === "1");
        shouldThrowInvalidConstAssignment(function() { --x; });
    })();
})();
