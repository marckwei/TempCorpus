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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

var object = {
    test001: 42
};

Object.defineProperty(object, "test001", {
    writable: false
});

function sd(obj) {
    let data = $vm.getStructureTransitionList(obj)
    let result = []

    if (!data)
        return result

    function kind(kind)
    {
        switch (kind) {
        case 1:
            return "added"
        case 2:
            return "deleted"
        case 3:
            return "attribute"
        default:
            return "unknown";
        }
    }

    for (let i = 0; i < data.length/5; ++i) {
        result.push({ offset: data[i*5+1], max: data[i*5+2], property: data[i*5+3], type: kind(data[i*5+4]) })
    }

    return result
}

shouldBe(JSON.stringify(sd(object)), `[{"offset":-1,"max":-1,"property":null,"type":"unknown"},{"offset":0,"max":0,"property":"test001","type":"added"},{"offset":0,"max":0,"property":"test001","type":"attribute"}]`);

delete object.test001;
shouldBe(JSON.stringify(sd(object)), `[{"offset":-1,"max":-1,"property":null,"type":"unknown"},{"offset":0,"max":0,"property":"test001","type":"added"},{"offset":0,"max":0,"property":"test001","type":"attribute"},{"offset":0,"max":0,"property":"test001","type":"deleted"}]`);

function lastStructureID()
{
    var object = {
        test001: 42
    };
    Object.defineProperty(object, "test001", {
        writable: false
    });
    var list = $vm.getStructureTransitionList(object);
    return list[list.length - 5];
}

var structureID = lastStructureID();
shouldBe(structureID, lastStructureID()); // Transition is traced.

var object = {
    test001: 42
};
Object.defineProperty(object, "test001", {
    writable: false
});
// Make it Dictionary.
for (var i = 0; i < 1000; ++i)
    object["test" + i] = i;
shouldBe(object.test001, 42);
shouldBe(JSON.stringify(Object.getOwnPropertyDescriptor(object, "test001")), `{"value":42,"writable":false,"enumerable":true,"configurable":true}`);
Object.defineProperty(object, "test001", {
    enumerable: false
});
shouldBe(JSON.stringify(Object.getOwnPropertyDescriptor(object, "test001")), `{"value":42,"writable":false,"enumerable":false,"configurable":true}`);
shouldBe(JSON.stringify(sd(object)), `[{"offset":-1,"max":1062,"property":null,"type":"unknown"},{"offset":0,"max":1062,"property":"test001","type":"attribute"}]`);
