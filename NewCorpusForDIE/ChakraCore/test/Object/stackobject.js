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


function Ctor()
{
    this.a = 400;
}
function test()
{
    // Test exercising variation of the mark tem objects
    var simple = {};
    simple.blah = 1;

    var literal = { a: 3 };

    var obj = new Ctor();
    
    var arrintlit = [ 1, 2 ];
    var arrfloatlit = [ 1.1 ];

    // this is not stack allocated yet. Need to modified loewring for NewScArray and inline build in constructors
    var typedarr = new Uint8Array(1);
    typedarr[0] = 2;

    var arr = [];
    arr[0] = 1;

    return simple.blah + literal.a + arr[0] + arr.length + typedarr[0] + typedarr.length + arrintlit[0] + obj.a + arrfloatlit[0];
}

WScript.Echo(test());
WScript.Echo(test());
