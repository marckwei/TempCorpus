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

function foo()
{
	var j1 = new Array;
	var m1 = [2,34];
	Array.prototype[24] = 22;

	j1[1000000000] = 20;

	var j2 = ["j2"];
	var k1 = [];
	k1.__proto__ = j2;
	k1[3] = 123;

	k1.length = 10;  /**bp:locals(2);resume('continue')**/

	var dummy = {};  
	dummy.x = m1;
	dummy.x[3000000000] = "very far";
	dummy.x;         /**bp:locals(2);resume('continue')**/
}
foo();

function foo1()
{
	var obj = {};
	obj[0] = 0;

	Object.defineProperty(obj, "1", {value: 1, enumerable: false});       /**bp:locals(1)**/

	obj;                          /**bp:locals(1)**/

	Object.defineProperty(arguments, "1", {value: 22, enumerable: false});       

	obj;                          /**bp:locals(1)**/
}
foo1(10);

function foo2()
{
	var o = {
		a: 1,
		"1": function(){}
	};
	var j = [13];
	j.x = {};
	o;        				         /**bp:locals(1)**/                      
}
foo2();

WScript.Echo("pass");
