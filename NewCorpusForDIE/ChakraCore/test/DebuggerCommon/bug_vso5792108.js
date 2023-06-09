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

// Cursor just after end of inner function
// breakpoint should be in outer function
function func1() {
    function func11() {
      var y = 1;
    }var x = 1; /**bp(5):dumpBreak();**/
    func11();
}
func1();

// Cursor just after end of inner function, but have line breaks after it
// breakpoint should be in inner function
function func2() {
    function func22() {
      var y = 1;
    }/**bp(5):dumpBreak();**/
    
    var x = 1;
    func22();
}
func2();

// Line break after end of inner function. Cursor in between 2 line breaks
// breakpoint should be in outer function
function func3() {
    function func33() {
      var y = 1;
    }
    /**bp(5):dumpBreak();**/
    var x = 1;
    func33();
}
func3();

// Cursor just after end of inner function in minified code
// breakpoint should be in outer function
function func4(){function func44(){var y=1;}/**bp(45):dumpBreak();**/var x=1;func44();}func4();

// Cursor just before start of inner function
// breakpoint should be in inner function
function func5() {
    var a = 1;
    function func55() {/**bp(4):dumpBreak();**/
      var y = 1;
    }var x = 1;
    func55();
}
func5();

// Cursor before line break of start of inner function
// breakpoint should be in inner function because there is a line break
function func6() {
    var a = 1;
    /**bp(4):dumpBreak();**/
    function func66() {
      var y = 1;
    }var x = 1;
    func66();
}
func6();

WScript.Echo("pass");