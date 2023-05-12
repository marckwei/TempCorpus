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

let assert = {
    sameValue(a, e) {
        if (a !== e)
            throw new Error("Expected: " + e + " but got: " + a);
    },
    sameArray(a, e) {
        if (a.length != e.length)
            throw new Error("Got array: " + a + " but expected: " + e);

        for (let i = 0; i < a.length; i++) {
            if (a[i] !== e[i])
                throw new Error("Got array: " + a + " but expected: " + e);
        }
    }
};

// Object Literal

let o = {
    30n: "30",
    0o1n: "1",
    0b10n: "2",
    0xan: "10",
    1_2_3n: "1_2_3"
};
assert.sameValue(o["1"], "1");
assert.sameValue(o["2"], "2");
assert.sameValue(o["10"], "10");
assert.sameValue(o["123"], "1_2_3");

// MethodDeclaration

o = {
  0b1n() {},
  *0o2n() {},
  async 0x3n() {},
  async* 4n() {},
  get 5n() {},
  set 6n(x) {},
  7n: function () {}
};

assert.sameArray(Object.getOwnPropertyNames(o), ["1", "2", "3", "4", "5", "6", "7"]);

assert.sameValue(o[1].name, "1");
assert.sameValue(o[2].name, "2");
assert.sameValue(o[3].name, "3");
assert.sameValue(o[4].name, "4");
assert.sameValue(Object.getOwnPropertyDescriptor(o, 5).get.name, "get 5");
assert.sameValue(Object.getOwnPropertyDescriptor(o, 6).set.name, "set 6");
assert.sameValue(o[7].name, "7");

{
    class C {
        0b1n() {};
        *0o2n() {};
        async 0x3n() {};
        async* 4n() {};
        get 5n() {};
        set 6n(x) {};
    }

    let c = C.prototype;
    assert.sameArray(Object.getOwnPropertyNames(c), ["1", "2", "3", "4", "5", "6", "constructor"]);
    assert.sameValue(c[1].name, "1");
    assert.sameValue(c[2].name, "2");
    assert.sameValue(c[3].name, "3");
    assert.sameValue(c[4].name, "4");
    assert.sameValue(Object.getOwnPropertyDescriptor(c, 5).get.name, "get 5");
    assert.sameValue(Object.getOwnPropertyDescriptor(c, 6).set.name, "set 6");
}

// Field declaration
{
    class C {
        0o1n = "baz";
        0b10n = function () {};
    }

    let c = new C();
    assert.sameValue(c[1n], "baz");
    assert.sameValue(c[1], "baz");
    assert.sameValue(c["1"], "baz");

    assert.sameValue(c[2].name, "2");
}

// Destructuring

let {1n: a} = {1n: "foo"};
assert.sameValue(a, "foo");

