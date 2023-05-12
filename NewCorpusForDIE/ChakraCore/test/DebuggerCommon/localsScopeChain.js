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

// Validates the locals scopes enumeration work, where scopes are mix of slot array and activation object.

function f0()
{
    var j0 =20;
    var j01 =20;
    
    function f1(a1)
    {
        var j = 10;
        var k = 20;
        var m = 20 + j0 + j01;
        function f2(b21, b22)
        {
            var j2 = arguments.length;
            var k2 = 10;
            function f3(c31,c32)
            {
                var a = 10;
                a++;                            /**bp:locals(1)**/
                a++;                            /**bp:evaluate('a');evaluate('j')**/
                return c31+c32+a;               /**bp:locals(1)**/
            }
            
            function f32()
            {
                j;
            }
            f3();
        }
        
        f2();
    }
    f1();
}
f0();

// Validating that valid locals value is shown, instead of picking from the dummy object

function foo(constructor){
  constructor.name;               /**bp:evaluate('constructor.name');evaluate('constructor',1)**/
}

foo({name:123});

WScript.Echo("Pass");
