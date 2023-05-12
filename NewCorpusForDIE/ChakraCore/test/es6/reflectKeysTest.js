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

function test1() {
    var sym1 = Symbol(), sym2 = Symbol(), sym3 = Symbol();
    var obj = {
        1: true,
        A: true,
    };
    obj.B = true;
    obj[sym1] = true;
    obj[2] = true;
    obj[sym2] = true;
    Object.defineProperty(obj, 'C', { value: true, enumerable: true });
    Object.defineProperty(obj, sym3, { value: true, enumerable: true });
    Object.defineProperty(obj, 'D', { value: true, enumerable: true });

    // Reflect.ownKeys
    print('Reflect.ownKeys');
    var result = Reflect.ownKeys(obj);
    for (var i in result) {
        print(result[i].toString());
    }

    // Object.getOwnPropertySymbols
    print('Object.getOwnPropertySymbols');
    result = Object.getOwnPropertySymbols(obj);
    for(var i in result) {
        print(result[i].toString());
    }
}

function test2() {
    function test() { };
    Object.defineProperty(test, 'A', { value: true, enumerable: true });
    Object.defineProperty(test, Symbol('blah'), { value: true, enumerable: true });
    Object.defineProperty(test, 'D', { value: true, enumerable: true });

    // special properties 
    print('Reflect.ownKeys with special properties');
    result = Reflect.ownKeys(test);
    for (var i in result) {
        print(result[i].toString());
    }

}

function test3() {
    var x = {};
    Object.defineProperty(x, "a", { value: 5, enumerable: true });
    Object.defineProperty(x, "b", { get: function () { return 23; }, enumerable: true });
    var p = new Proxy(x, {
        getOwnPropertyDescriptor: function (target, property) {
            return Reflect.getOwnPropertyDescriptor(target, property);
        }
    });
    print(Object.keys(p));
}

function test4() {
    function bar() { };

    var foo = new Proxy(bar, {});
    print(Object.getOwnPropertyNames(foo));
    print(Reflect.ownKeys(foo));
}


test1();
test2();
test3();
test4();
