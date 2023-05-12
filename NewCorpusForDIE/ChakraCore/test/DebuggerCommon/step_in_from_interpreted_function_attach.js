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

/*
    Step in from Interpreted function
*/

function foo() {
    var a = "foo";
    var b = new Array();
    var c = arguments;
    bar(); /**loc(bp1):
        resume('step_into');
        resume('step_over');
        resume('step_over');
        resume('step_over');
        stack();
        locals(2) 
        **/
}

function bar() {
    var a = "bar";
    var b = [];
    var c = new Date();   
}

function Run() {
    bar();
    bar();
    //Only bar is JITted
    //foo is still interpreted
    //foo->bar
    foo();/**bp:enableBp('bp1')**/
    foo; /**bp:disableBp('bp1')**/
    WScript.Echo('PASSED');
}

bar();
bar();
//Only bar is JITted
WScript.Attach(Run);