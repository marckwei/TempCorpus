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
"This test checks that toString() round-trip on a function that has a expression of form 4..x does not lose its meaning."
+ " The expression accesses the property 'x' from number '4'."
);

// construct same test-case for different kinds of number literals. the switch is used to avoid
// individual returns getting optimized away (if the interpreter would do dead code elimination)

// testcase for number literal with decimal point, i.e '4.'
function f1(a) {
    switch(a) {
    case "member":
        return 4..x;
    case "arrayget":
        return 4.["x"];
    case "constr":
        return 4.();
    case "funccall":
        return 4..f();
    case "parenfunccall":
        return (4..x)();
    case "assignment":
        return 4..x = 33;
    case "assignment2":
        return 4..x >>>= 1;
    case "prefix":
        return ++4..x;
    case "postfix":
        return 4..x++;
   case "delete":
        delete 4..x;
        return 4..x;
    }

    return 0;
}

// '4. .'
function f2(a) {
    switch(a) {
    case "member":
        return 4. .x;
    case "arrayget":
        return 4. ["x"];
    case "constr":
        return 4.();
    case "funccall":
        return 4. .f();
    case "parenfunccall":
        return (4. .x)();
    case "assignment":
        return 4. .x = 33;
    case "assignment2":
        return 4. .x >>>= 1;
    case "prefix":
        return ++4. .x;
    case "postfix":
        return 4. .x++;
    case "delete":
        delete 4. .x;
        return 4. .x;
    }

    return 0;
}

// '4e20'
function f2(a) {
    switch(a) {
    case "member":
        return 4e20.x;
    case "arrayget":
        return 4e20["x"];
    case "constr":
        return 4e20();
    case "funccall":
        return 4e20.f();
    case "parenfunccall":
        return (4e20.x)();
    case "assignment":
        return 4e20.x = 33;
    case "assignment2":
        return 4e20.x >>>= 1;
    case "prefix":
        return ++4e20.x;
    case "postfix":
        return 4e20.x++;
    case "delete":
        delete 4e20.x;
        return 4e20.x;
    }

    return 0;
}

// '4.1e-20'
function f3(a) {
    switch(a) {
    case "member":
        return 4.1e-20.x;
    case "arrayget":
        return 4.1e-20["x"];
    case "constr":
        return 4.1e-20();
    case "funccall":
        return 4.1e-20.f();
    case "parenfunccall":
        return (4.1e-20.x)();
    case "assignment":
        return 4.1e-20.x = 33;
    case "assignment2":
        return 4.1e-20.x >>>= 1;
    case "prefix":
        return ++4.1e-20.x;
    case "postfix":
        return 4.1e-20.x++;
   case "delete":
        delete 4.1e-20.x;
        return 4.1e-20.x;
    }

    return 0;
}

// '4'
function f4(a) {
    switch(a) {
    case "member":
        return 4 .x;
    case "arrayget":
        return 4["x"];
    case "constr":
        return 4();
    case "funccall":
        return 4 .f();
    case "parenfunccall":
        return (4 .x)();
    case "assignment":
        return 4 .x = 33;
    case "assignment2":
        return 4 .x >>>= 1;
    case "prefix":
        return ++4 .x;
    case "postfix":
        return 4 .x++;
    case "delete":
        delete 4 .x;
        return 4 .x;

    }

    return 0;
}

// '(4)'
function f5(a) {
    switch(a) {
    case "member":
        return (4).x;
    case "arrayget":
        return (4)["x"];
    case "constr":
        return (4)();
    case "funccall":
        return (4).f();
    case "parenfunccall":
        return ((4).x)();
    case "assignment":
        return (4).x = 33;
    case "assignment2":
        return (4).x >>>= 1;
    case "prefix":
        return ++(4).x;
    case "postfix":
        return (4).x++;
    case "delete":
        delete (4).x;
        return (4).x;
    }

    return 0;
}
unevalf = function(x) { return '(' + x.toString() + ')'; };

function testToString(fn) 
{
    shouldBe("unevalf(eval(unevalf(" + fn + ")))", "unevalf(" + fn + ")");
}

for(var i = 1; i < 6; ++i)
    testToString("f" + i);
