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

function check(str) {
    var res = eval(str);
    write((typeof res) + " : " + res);
}

var count = 0;
function fn() { return count++;}
function fs() { count++; return (count % 2 ) ? "str1" : "str2"; }
function fb() { count++; return (count % 2 ) ? true : false;    }

var list = [ "fn", "fs", "fb" ];
var vars = [ "o", "n", "d", "a", "b"];

var o = {};
var n = new Number(123456);
var d = new Date("Thu Jan 10 05:30:01 UTC+0530 1970");
var a = [];
var b = new Boolean(true);
        
a[0] = o; a[1] = n; a[2] = d; a[3] = a; a[4] = b;
check("a.toString()");
check("a.toLocaleString()");

for (var i=0; i<list.length; i++) {
    for (var j=0; j<list.length; j++) {
        eval("o.toLocaleString = " + list[i]);
        eval("o.toString = " + list[j]);
        
        eval("n.toLocaleString = " + list[i]);
        eval("n.toString = " + list[j]);
        
        eval("d.toLocaleString = " + list[i]);
        eval("d.toString = " + list[j]);
        
        eval("b.toLocaleString = " + list[i]);
        eval("b.toString = " + list[j]);

        a[0] = o; a[1] = n; a[2] = d; a[3] = a; a[4] = b;
        
        for (var k=0; k<vars.length; k++) {
            check(vars[k] + ".toString()");
            check(vars[k] + ".toLocaleString()");
        }
    }
}

var o1 = {};
var n1 = new Number(123456);
var d1 = new Date("Thu Jan 10 05:30:01 UTC+0530 1970");
var b1 = new Boolean(true);

a[0] = o1; a[1] = n1; a[2] = d1; a[3] = a; a[4] = b1;
for (var i=0; i<list.length; i++) {
    for (var j=0; j<list.length; j++) {
        eval("a.toLocaleString = " + list[i]);
        eval("a.toString = " + list[j]);
               
        check("a.toString()");
        check("a.toLocaleString()");
    }
}