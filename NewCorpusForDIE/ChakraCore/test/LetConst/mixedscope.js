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

let level1Func_1 = function level_1_identifier_0() {   
   const a= 1;  
   function level2Func() {
      eval("print(a)");
   }
   level2Func();
}
level1Func_1();

var level1Func_2 = function level_1_identifier_0() {   
    let level_1_identifier_2= "level1";    
          

    function level2Func() {        
           print(typeof level_1_identifier_0);
           level_1_identifier_2 += "level2";
    }
    level2Func();     
    print(level_1_identifier_2);

}
level1Func_2();

function a() {
    const x = 'x';
    const y = 'y';
    function b() {
        return true ? 0 : x
    }
    function c() {
        return false ? y : 1
    }
    print(b());
    print(null);
    print(c());
    print(null);
}
a();

function print(x) { WScript.Echo(x); }

