function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

WScript = {
    _jscGC: gc,
    _jscPrint: console.log,
    _convertPathname : function(dosStylePath)
    {
        return dosStylePath.replace(/\\/g, "/");
    },
    Arguments : [ "summary" ],
    Echo : function()
    {
        WScript._jscPrint.apply(this, arguments);
    },
    LoadScriptFile : function(path)
    {
    },
    Quit : function()
    {
    },
    Platform :
    {
        "BUILD_TYPE": "Debug"
    }
};

function CollectGarbage()
{
    WScript._jscGC();
}

function $ERROR(e)
{
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

//-------------------------------------------------------------------------------------------------------
// Copyright (C) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

// Verifies the order of getOwnPropertyDescriptor trap called for ownKeys
function test1() {
    var obj = {};
    var proxy = new Proxy(obj, {
        getOwnPropertyDescriptor: function (target, property) {
            print('getOwnPropertyDescriptor on proxy : ' + property.toString());
            return { configurable: true, enumerable: true, value: 10 };
        },

        ownKeys: function (target) {
            print('ownKeys for proxy');
            return ["prop0", "prop1", Symbol("prop2"), Symbol("prop5")];
        }
    });

    var proxy2 = new Proxy(proxy, {
        getOwnPropertyDescriptor: function (target, property) {
            print('getOwnPropertyDescriptor on proxy2 : ' + property.toString());
            return { configurable: true, enumerable: true, value: 10 };
        },

        ownKeys: function (target) {
            print('ownKeys for proxy2');
            return ["prop2", "prop3", Symbol("prop4"), Symbol("prop5")];
        }
    });

    print('***Testing Object.getOwnPropertyNames()');
    print(Object.getOwnPropertyNames(proxy2));
    print('***Testing Object.keys()');
    print(Object.keys(proxy2));
    print('***Testing Object.getOwnPropertySymbols()');
    print(Object.getOwnPropertySymbols(proxy2).length);

    print('***Testing Object.freeze()');
    try{
        Object.freeze(proxy2);
        print('Object.freeze should fail because underlying OwnPropertyKeys should fail since target becomes non-extensible');
    } catch (e) {
        if (!(e instanceof TypeError)) {
            $ERROR('incorrect instanceof Error' + e);
        }
    }
}

// Verifies that we don't call GetPropertyDescriptor of target for Object.keys unnecessarily if we throw TypeERROR before
function test2() {
    var obj = {};
    Object.defineProperty(obj, "a", { value: 5, configurable: false });
    var proxy = new Proxy(obj, {
        getOwnPropertyDescriptor: function (target, property) {
            print('getOwnPropertyDescriptor on proxy : ' + property.toString());
            return Object.getOwnPropertyDescriptor(target, property);
        },

        ownKeys: function (target) {
            print('ownKeys for proxy');
            return ["a", "prop0", "prop1", Symbol("prop2"), Symbol("prop5")];
        }
    });


    var proxy2 = new Proxy(proxy, {
        getOwnPropertyDescriptor: function (target, property) {
            print('getOwnPropertyDescriptor on proxy2 : ' + property.toString());
            return Object.getOwnPropertyDescriptor(target, property);
        },

        ownKeys: function (target) {
            print('ownKeys for proxy2');
            return ["prop2", "prop3", Symbol("prop4"), Symbol("prop5")];
        }
    });

    print('***Testing Object.keys()');
    try{
        print(Object.keys(proxy2));
        print('Should throw TypeError because ownKeys doesnt return non-configurable key.');
    } catch (e) {
        if (!(e instanceof TypeError)) {
            print('incorrect instanceof Error');
        }
    }
}

function test3() {
    var obj = {};
    var count = 0;
    var proxy = new Proxy(obj, {

        get: function (target, property, receiver) {
            print('get on proxy : ' + property.toString());
            return count++ * 5;
        },
        getOwnPropertyDescriptor: function (target, property) {
            print('getOwnPropertyDescriptor on proxy : ' + property.toString());
            return { configurable: true, enumerable: true, value: 10 };
        },

        ownKeys: function (target) {
            print('ownKeys for proxy');
            return ["prop0", "prop1", Symbol("prop2"), Symbol("prop5")];
        }
    });

    var proxy2 = new Proxy(proxy, {
        get: function (target, property, receiver) {
            print('get on proxy2 : ' + property.toString());
            return Reflect.get(target, property, receiver);
        },
        getOwnPropertyDescriptor: function (target, property) {
            print('getOwnPropertyDescriptor on proxy2 : ' + property.toString());

            return { configurable: true, enumerable: true, value: 10 };
        },

        ownKeys: function (target) {
            print('ownKeys for proxy2');
            return ["prop2", "prop3",  Symbol("prop4"), Symbol("prop5")];
        }
    });

    print('***Testing Object.assign()');
    var answer = Object.assign(obj, null, proxy, proxy2);
    var symbols = Object.getOwnPropertySymbols(answer);
    var names = Object.getOwnPropertyNames(answer);
    print("PropertyNames returned : ");
    for (i = 0; i < names.length; i++)
    {
        print(names[i].toString())
    }
    print("PropertySymbols returned : ");
    for (i = 0; i < symbols.length; i++)
    {
        print(symbols[i].toString())
    }

}

function test4() {
    print("***Traps whose value is null are ignored");

    function getProxy(trap, result, obj) {
        const proxy = new Proxy(obj, {
            [trap]: () => {
                print(`"${trap}" called`);
                return result;
            }
        });
        return new Proxy(proxy, {
            [trap]: null
        });
    }

    Object.getPrototypeOf(getProxy("getPrototypeOf", {}, {}));
    Object.setPrototypeOf(getProxy("setPrototypeOf", true, {}), {});
    Object.isExtensible(getProxy("isExtensible", true, {}));
    Object.preventExtensions(getProxy("preventExtensions", false, {}));
    Object.getOwnPropertyDescriptor(getProxy("getOwnPropertyDescriptor", undefined, {}));
    Object.defineProperty(getProxy("defineProperty", true, {}), "prop", { value: 0 });
    "prop" in getProxy("has", true, {});
    getProxy("get", 0, {}).prop;
    getProxy("set", true, {}).prop = 0;
    delete getProxy("deleteProperty", true, {}).prop;
    Object.keys(getProxy("ownKeys", [], {}));
    getProxy("apply", 0, function () {})();
    new (getProxy("construct", {}, function () {}));
}

function test5() {
    print("***function wrapped in 2+ proxies");

    function a() {}

    const p1 = new Proxy(a, {})
    console.log(typeof p1) // "function"
    
    const p2 = new Proxy(p1, {})
    console.log(typeof p2) // "function"

    const p3 = new Proxy(p2, {})
    console.log(typeof p3) // "function"
}

function test6() {
    print("*** proxied function and Object.prototype.toString.call");

    console.log(Object.prototype.toString.call(new Proxy(function a() {}, {})));
    // "[object Function]"

    console.log(Object.prototype.toString.call(new Proxy(new Proxy(function a() {}, {}), {})));
    // "[object Function]"

    console.log(Object.prototype.toString.call(new Proxy([], {})));
    // "[object Array]"
    
    console.log(Object.prototype.toString.call(new Proxy(new Number(1), {})));
    // "[object Object]"
    
    console.log(Object.prototype.toString.call(new Proxy(new String(""), {})));
    // "[object Object]"
    
    console.log(Object.prototype.toString.call(new Proxy(new Boolean(true), {})));
    // "[object Object]"
    
    console.log(Object.prototype.toString.call(new Proxy(new Date, {})));
    // "[object Object]"
}

function test7() {
    print("*** proxied function and Function.prototype.toString.call");

    console.log(Function.prototype.toString.call(new Proxy(function a() { }, {})));
    // "function a() { }"

    console.log(Function.prototype.toString.call(new Proxy(new Proxy(function a() { }, {}), {})));
    // "function a() { }"
}

function test8() {
    print("*** deeply nested proxy and typeof");

    var nestedProxy = Proxy.revocable([], {}).proxy;
    for (let i = 0; i < 1e5; i++) {
        nestedProxy = new Proxy(nestedProxy, {});
    }

    (function () {
        if (nestedProxy != null && typeof nestedProxy == "object")
        {
            console.log("pass");
        }
    })();
}

test1();
test2();
test3();
test4();
test5();
test6();
test7();
test8();
