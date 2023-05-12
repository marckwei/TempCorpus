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

var s1 =

'function f1() {' +
'    var a = "a";' +
'    function g1() {' +
'        WScript.Echo(a);' +
'    }' +
'    return g1;' +
'}';

eval(s1);
WScript.Echo('done s1');
var foo1 = f1();
WScript.Echo('done f1');
foo1();

var s2 =

'var a = "global a";' +
'function f2(i) {' +
'    with ({a:"with a"}) {' +
'        var g2 = function() {' +
'            WScript.Echo(a);' +
'        };' +
'        function g2_() {' +
'            WScript.Echo(a);' +
'        }' +
'    }' +
'    switch(i) {' +
'        case 0: return g2;' +
'        case 1: return g2_;' +
'    }' +
'}';

eval(s2);
WScript.Echo('done s2');
var foo2 = f2(0);
var foo2_ = f2(1);
WScript.Echo('done f2');
foo2();
foo2_();

var s3 = 

'function f3(i) {' +
'    var a = "f3 a";' +
'    function g3(i) {' +
'        try {' +
'            throw "catch";' +
'        }' +
'        catch(a) {' +
'            function g4_() {' +
'                WScript.Echo(a);' +
'            }' +
'            var g4 = function() {' +
'                WScript.Echo(a);' +
'            };' +
'            return i == 0 ? g4 : g4_;' +
'        }' +
'    }' +
'    return g3(i);' +
'}';

eval(s3);
WScript.Echo('done s3');
var foo3 = f3(0);
var foo3_ = f3(1);
WScript.Echo('done f3');
foo3();
foo3_();
