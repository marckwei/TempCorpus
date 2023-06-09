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

// Validation of the edit-values on the jitted frame.

function bar (c)
{
    var m = 10;
    
    return m;       /**bp:locals();
                    setFrame(1);locals(0);evaluate('m');
                    evaluate('m = 23');evaluate('m');evaluate('arg2 = {abc:11}');
                    setFrame(2);
                    evaluate('k.x = 21')**/
}

function bar1(k)
{
    k++;
    k++;             /**bp:setFrame(1);
                       evaluate('arg2',1);evaluate('m');evaluate('m = [1,2,3]');evaluate('m');
                       setFrame(2);evaluate('k1 = function() {}');**/
}
function bar2()
{
    var j = 10;  /**bp:setFrame(1);evaluate('k',1);evaluate('k1', 1);**/
}

function outer(arg1)
{
    var k = new Object();
    var k1 = [1,2];
    
    function f1(arg2)
    {
        var m = 10;
        var m2 = 55;
        bar(10);
        m;
        bar1(22);
        return m;
    }
    f1(123 + arg1);
    bar2();
}

outer(21);

WScript.Echo("Pass");
