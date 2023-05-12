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

//flags : -off:simplejit -mic:1
function TwoProperty(p, q) {
    this.p = p;
    this.q = q;
}

function OneProperty(x){
    this.x = x;
}


function CreateTwoPropertyObj()
{
    var a = new TwoProperty(2, 3);
    return a;
}

function CreateOnePropertyObj()
{
    var a = new OneProperty(4)
    return a;
}


function grow(a, r, s)
{
    a.r = r;
    a.s = s;
}
 
var obj;
var obj1;

for(i = 0; i < 5; i++)
{
    obj = CreateTwoPropertyObj();
    obj1 = CreateOnePropertyObj();
}


//Try grow and overwrite properties.
grow(obj, 10, 20);

obj = CreateTwoPropertyObj();
grow(obj, 10, 20);

obj = CreateTwoPropertyObj();
grow(obj, 10, 20);

WScript.Echo(obj.p);
WScript.Echo(obj.q);
WScript.Echo(obj.r);
WScript.Echo(obj.s);
WScript.Echo(obj1.x);
    
 
