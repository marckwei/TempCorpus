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

WScript.LoadScriptFile("..\\UnitTestFramework\\UnitTestFramework.js");

function correctProtoBound(proto, functionType) {
    Object.setPrototypeOf(functionType, proto);
    var boundF = Function.prototype.bind.call(functionType, null);
    return Object.getPrototypeOf(boundF) === proto;
}

var tests = [
   {
       name: "Basic Function",
       body: function ()
       {
            var f = function(){};
            var a = correctProtoBound(Function.prototype, f) && correctProtoBound({}, f)
                    && correctProtoBound(null, f);
            assert.isTrue(a, "confirm Let proto be targetFunction.[[GetPrototypeOf]](). is performed on basic functions");
       }
   },
   {
       name: "Generator Functions",
       body: function ()
       {
            var gf = function*(){};
            var a = correctProtoBound(Function.prototype, gf) && correctProtoBound({}, gf)
                    && correctProtoBound(null, gf);
            assert.isTrue(a, "confirm Let proto be targetFunction.[[GetPrototypeOf]](). is performed on generator functions");
       }
   },
   {
       name: "Arrow Functions",
       body: function ()
       {
            var arrowfunction = ()=>5;
            var a = correctProtoBound(Function.prototype, arrowfunction) && correctProtoBound({}, arrowfunction)
                    && correctProtoBound(null, arrowfunction);
            assert.isTrue(a, "confirm Let proto be targetFunction.[[GetPrototypeOf]](). is performed on arrow functions");
       }
   },
   {
       name: "Classes",
       body: function ()
       {
            class C {}
            var a = correctProtoBound(Function.prototype, C) && correctProtoBound({}, C)
                        && correctProtoBound(null, C);
            assert.isTrue(a, "confirm Let proto be targetFunction.[[GetPrototypeOf]](). is performed on classes");
       }
   },
   {
       name: "subClasses",
       body: function ()
       {
            function correctProtoBound(superclass) {
                class C extends superclass {
                    constructor() {
                        return Object.create(null);
                    }
                }
                var boundF = Function.prototype.bind.call(C, null);
                return Object.getPrototypeOf(boundF) === Object.getPrototypeOf(C);
            }
            var a = correctProtoBound(Array) && correctProtoBound(null) &&
                    correctProtoBound(function() {});
            assert.isTrue(a, "confirm Let proto be targetFunction.[[GetPrototypeOf]](). is performed on subclasses");
       }
   },
   {
       name: "Proxy Function",
       body: function ()
       {
            function correctProtoBound(proto) {
                var p = new Proxy(function(){}, {});
                Object.setPrototypeOf(p, proto);
                var boundF = Function.prototype.bind.call(p, null);
                return Object.getPrototypeOf(boundF) === proto;
            }
            var a = correctProtoBound(Function.prototype) && correctProtoBound({});
                    //&& correctProtoBound(null); proxy bug on setPrototypeOf for this case OS bug# 3842393
            assert.isTrue(a, "confirm Let proto be targetFunction.[[GetPrototypeOf]](). is performed on proxy functions");
       }
   }
];
testRunner.runTests(tests, { verbose: WScript.Arguments[0] != "summary" });
