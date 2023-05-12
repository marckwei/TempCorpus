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

  // return double 
  // do while and while loops
  function AsmModule(stdlib) {
    "use asm";      
    var x1 = 10;
    var fr = stdlib.Math.fround;
    function f3(x,y){
        x = fr(x);
        y = fr(y);
        var m = 1;
        var n = 10;
        var z = 1.1;

       a: while( (m|0) < 30)
        {
            x = fr(x+y);
            do
            {
                if((n|0) > 50)
                    return fr(x);
                x = fr(x+y);                
                n = (n+1)|0
            }while((n|0) < 100)
        }
        return fr(x);
    }
    
    return f3
}
var stdlib = {Math:Math}
var f3 = AsmModule(stdlib);
print(f3  (1,1.5))  
print(f3  (1,1.5))   