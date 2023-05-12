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

function f1(x) {
    try {
        throw 'catch';
    }
    catch (x) {
        var f2 = function () {
            WScript.Echo(x);
        }
        f2();
        function f3() {
            WScript.Echo(x);
            try {
                throw 'catch2';
            }
            catch (y) {
                f2();
                var f4 = function () {
                    WScript.Echo(x, y);
                }
                function f5() {
                    WScript.Echo(x, y);
                }
            }
            f4();
            f5();
        }
        f3();
    }
}
y = 'y';
f1('param');

function f10(){
    var ex = 'Carey Price';
    try {
        throw 1;
    } catch(ex) {
        try {
            throw 2;
        } catch(ex) {
            function f11 (){};
            function f12 (){ WScript.Echo(ex); };
        }
    }
    f12();
};
f10();

function outer(g) {
    function inner() {
        try {
            throw 1;
        }
        catch(g) {
            if (g !== 1) 
                WScript.Echo('g === ' + g + ' in catch');
        }
    }
    inner();
    if (g !== 'g')
        WScript.Echo('g === ' + g + ' in "inner"');
}
outer('g');
