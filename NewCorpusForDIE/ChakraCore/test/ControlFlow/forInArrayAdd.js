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

function write(args)
{
    if (typeof (WScript) == "undefined")
        print(args);
    else
        WScript.Echo(args);
}

var a = [11,22,33,44];
a.x = "a.x";
a.y = "a.y";
a.z = "a.z";

write("Scenario:1 - Adding new array indexes while enumerating expandos")

for( var i in a)
{
  if(i == "y")
  {
    a[5] = 55;
    a[6] = 66;
  }
  write("Index:" + i + " Value:" + a[i]);
}

write("Scenario:2 - Adding new array expandos while enumerating array for second time")

for( var i in a)
{
  if(i == "z")
  {
      a[7] = 77;
      a[9] = 99;
  }
  if(i == "7")
  {
     a.xx = "a.xx";
     a.yy = "a.yy";
  }
  write("Index:" + i + " Value:" + a[i]);
}

write("Scenario:3 - Adding new array expandos while enumerating Object for second time")

var b = [11,22,33,44];
b.x = "b.x";
b.y = "b.y";
b.z = "b.z";

for( var i in b)
{
  if(i == "x")
  {
    b[5] = 55;
    b[7] = 77;
  }
  if(i == "7")
  {
     b.xx = "b.xx";
     b.yy = "b.yy";
  }

  if(i == "xx")
  {
    b[9] = 99;
    b[10] = 1010;
  }

  if(i == "9")
  {
     b.zz = "b.zz";
  }
  write("Index:" + i + " Value:" + b[i]);
}

write("Scenario:3 - Adding new array expandos while enumerating Object for second time")

var b = [11,22,33,44];
b.x = "b.x";
b.y = "b.y";
b.z = "b.z";

for( var i in b)
{
  if(i == "x")
  {
    b[5] = 55;
    b[7] = 77;
  }
  if(i == "7")
  {
     b.xx = "b.xx";
     b.yy = "b.yy";
  }

  if(i == "xx")
  {
    b[9] = 99;
    b[10] = 1010;
  }

  if(i == "9")
  {
     b.zz = "b.zz";
  }
  write("Index:" + i + " Value:" + b[i]);
}

write("Scenario:4 - random additions");

var d = [1];
var counter = 0;

for (var i in d)
{
  if(counter == 25)
  {
    break;
  }
  if(counter%2 == 1)
  {
    d[counter*counter] = counter*counter;
  }
  else
  {
    d["x"+counter] = "d.x"+counter;
  }
  write("Index:" + i + " Value:" + d[i]);
  counter++;
}
