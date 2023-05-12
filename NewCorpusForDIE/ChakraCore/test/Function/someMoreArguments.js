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

function write(v) { WScript.Echo(v + ""); }

//
// function f1_* just access arguments inside eval
//
(function f1_0() {
    write(eval('arguments'));
}) ("something");

(function f1_1(arguments) {    
    write(eval('arguments'));
}) ("something");

(function f1_2(arguments) {
    var x = 10;    
    write(eval('arguments + " " + x'));
}) ("something");

(function f1_3() {
    var arguments = 10;    
    write(eval('arguments'));
}) ("something");

(function f1_4() {
    function arguments() { }
    write(eval('arguments'));
}) ("something");

(function f1_5(arguments, arguments) {
    write(eval('arguments'));
}) ("something");


//
// function f2_* access arguments inside function and then access arguments inside eval
//

(function f2_0() {
    write(arguments);
    write(eval('arguments'));
}) ("something 2");

(function f2_1(arguments) {    
    write(arguments);
    write(eval('arguments'));
}) ("something 2");

(function f2_2(arguments) {
    var x = 10;    
    write(arguments);
    write(eval('arguments + " " + x'));
}) ("something 2");

(function f2_3() {
    var arguments = 10;  
    write(arguments);  
    write(eval('arguments'));
}) ("something 2");

(function f2_4() {
    function arguments() { }
    write(arguments);
    write(eval('arguments'));
}) ("something 2");

(function f2_5(arguments, arguments) {
    write(arguments);
    write(eval('arguments'));
}) ("something 2");