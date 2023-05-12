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

// Validating the global scopes variables, ie. glo function and global at eval code.

function foo() {
    var mm = [22, 33];
    eval(' function f1() {}; \nvar a = 10; \nvar b= {};\n a;\n b; /**bp:locals(1);evaluate("mm")**/ \n var c1 = [1]; \nc;');
    eval(' try { \n abc.def = 10;\n } catch(ex1) { \n ex1; /**bp:stack();locals(1);evaluate("ex1");evaluate("c1")**/ } \nc;');
}

foo();

function bar() { }
bar;                             /**bp:locals(1);**/

try {
    abdd.dd = 20;
}
catch (ex2) {
    ex2;                        /**bp:locals(1);**/
}

var obj = { x: 10, y: [11, 22] };

with (obj) {
    var c = x;
    c;                          /**bp:locals(1);evaluate('y')**/
}

c++;

WScript.Echo("Pass");
