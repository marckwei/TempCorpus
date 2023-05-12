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

function assert(b) {
    if (!b)
        throw new Error("Bad assertion.");
}
function test(f) {
    for (let i = 0; i < 500; i++)
        f();
}

var originalReflect = Reflect;
var ownKeys = Reflect.ownKeys;
var getOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor;

function runTests() {
    test(function() {
        let ownKeysCalled = false;
        let getOwnPropertyDescriptorProps = [];
        let getProps = [];
        let enumerableCalled = false;
        let handler = {
            getOwnPropertyDescriptor: function(target, key) {
                getOwnPropertyDescriptorProps.push(key);
                switch(key) {
                case "foo":
                    return {
                        enumerable: true,
                        configurable: true,
                        value: 45
                    };
                case "bar":
                    return  {
                        enumerable: true,
                        get enumerable() {
                            enumerableCalled = true;
                            return true;
                        },
                        configurable: true,
                        value: 50
                    }
                case "baz":
                    return  {
                        enumerable: false,
                        configurable: true,
                        value: 50
                    }
                default:
                    assert(false, "should not be reached.");
                    break;
                }
            },
            ownKeys: function(target) {
                ownKeysCalled = true;
                return ["foo", "bar", "baz"];
            },
            get: function(target, key) {
                getProps.push(key);
                switch(key) {
                case "foo":
                    return 20;
                case "bar":
                    return "bar";
                default:
                    assert(false, "should not be reached.");
                    break;
                }
            }
        };

        let proxy = new Proxy({}, handler);
        let foo = {};
        Object.assign(foo, proxy);

        assert(enumerableCalled);

        assert(ownKeys(foo).length === 2);
        assert(ownKeys(foo)[0] === "foo");
        assert(ownKeys(foo)[1] === "bar");
        assert(foo.foo === 20);
        assert(foo.bar === "bar");

        assert(ownKeysCalled);
        assert(getOwnPropertyDescriptorProps.length === 3);
        assert(getOwnPropertyDescriptorProps[0] === "foo");
        assert(getOwnPropertyDescriptorProps[1] === "bar");
        assert(getOwnPropertyDescriptorProps[2] === "baz");

        assert(getProps.length === 2);
        assert(getProps[0] === "foo");
        assert(getProps[1] === "bar");
    });


    let oldReflect = Reflect;
    Reflect = null;
    assert(Reflect === null); // Make sure Object.assign's use of Reflect is safe.

    test(function() {
        let ownKeysCalled = false;
        let getOwnPropertyDescriptorProps = [];
        let getProps = [];
        let enumerableCalled = false;
        let handler = {
            getOwnPropertyDescriptor: function(target, key) {
                getOwnPropertyDescriptorProps.push(key);
                switch(key) {
                case "foo":
                    return {
                        enumerable: true,
                        configurable: true,
                        value: 45
                    };
                case "bar":
                    return  {
                        get enumerable() {
                            enumerableCalled = true;
                            return true;
                        },
                        configurable: true,
                        value: 50
                    }
                case "baz":
                    return  {
                        enumerable: false,
                        configurable: true,
                        value: 50
                    }
                default:
                    assert(false, "should not be reached.");
                    break;
                }
            },
            ownKeys: function(target) {
                ownKeysCalled = true;
                return ["foo", "bar", "baz"];
            },
            get: function(target, key) {
                getProps.push(key);
                switch(key) {
                case "foo":
                    return 20;
                case "bar":
                    return "bar";
                default:
                    assert(false, "should not be reached.");
                    break;
                }
            }
        };

        let proxy = new Proxy({}, handler);
        let foo = {};
        Object.assign(foo, proxy);

        assert(enumerableCalled);

        assert(ownKeys(foo).length === 2);
        assert(ownKeys(foo)[0] === "foo");
        assert(ownKeys(foo)[1] === "bar");
        assert(foo.foo === 20);
        assert(foo.bar === "bar");

        assert(ownKeysCalled);
        assert(getOwnPropertyDescriptorProps.length === 3);
        assert(getOwnPropertyDescriptorProps[0] === "foo");
        assert(getOwnPropertyDescriptorProps[1] === "bar");
        assert(getOwnPropertyDescriptorProps[2] === "baz");

        assert(getProps.length === 2);
        assert(getProps[0] === "foo");
        assert(getProps[1] === "bar");

    });

    Reflect = oldReflect;
}

runTests();
Reflect.ownKeys = function () {};
Reflect.getOwnPropertyDescriptor = function () {};
runTests();
