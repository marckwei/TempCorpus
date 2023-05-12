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

 function AsmModule(stdlib,foreign) {
    "use asm";

    var fun2 = foreign.fun2;

    
   

    function mul(x,y) {
        x = +x;
        y = +y;
        
        return (+(x*y));
    }

    
    function f2(x,y){
        x = +x;
        y = y|0;
        var i = 0, j = 0.0;
        j = +mul(+mul(x,1.),+mul(x,1.));
        return +j;
    }
    
    function f3(x){
        x = x|0;
        var i = 0.
        i = +f2(100.5,1);       
        i = +f2(5.5,1);
        return +i;
    }
    
    return f3;
}

var global = {}
var env = {fun2:function(x){print(x);}}

var asmModule = AsmModule(global,env)
print(asmModule  ( 1))

