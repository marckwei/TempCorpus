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

function g()
{
	var x = 2;
	x++;
	throw "this is an exception";
	x++;
}

function f()
{
	var c = 5;
	var obj = { x: 2, y: 3, o2: {a: 44}};
	try {
		g();   /**bp(test):locals();resume('step_into');locals();resume('step_into');locals();**/
	} catch(ex) {
		WScript.Echo("caught: " + ex);
	}
	d = 7;
	c = 7; /**bp(bp1):stack();**/
	c = 8; /**bp:locals(2)**/
	c = 9; 
}
for(var i = 0; i < 5; ++i)
	f();
	
function g1() { }
function f1() {
	var x = 2;
	g1.apply(this, arguments);  /**bp:locals(1);**/
	x++;					   /**bp:locals(1);**/
}

f1(10);