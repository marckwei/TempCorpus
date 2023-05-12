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

WScript.Echo("-------Named Type Test Start------------------");
var obj = JSON.parse('{"2a":"foo"}', function(key, value){
    WScript.Echo(key, ':', value);
    return value;
});
WScript.Echo(obj["2a"]);
WScript.Echo("-------Named Type Test End--------------------");
WScript.Echo("-------Simple Numeral Type Test Start---------");
var obj2 = JSON.parse('{"2":"foo"}', function(key, value){
    WScript.Echo(key, ':', value);
    return value;
});
WScript.Echo(obj2["2"]);
WScript.Echo("-------Simple  Numeral Type Test End----------");
WScript.Echo("-------Complex Numeral Type Test Start--------");
var obj3 = JSON.parse('{"3":{"1":"foo"}}', function(key, value){
     WScript.Echo(key, ':', value);
    return value;
});
WScript.Echo(obj3["3"]);
WScript.Echo("-------Complex Numeral Type Test End----------");
