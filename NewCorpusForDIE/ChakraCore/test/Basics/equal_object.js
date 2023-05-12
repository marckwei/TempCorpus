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
  WScript.Echo(""+args);
}

var o = {toString: function(){write("Inside toString"); return "abc";}, valueOf: function(){write("Inside valueOf");return 10;}};

write("Scenario 1");
write(o==10);
write(o=="abc");
write(10==o);
write("abc"==o);


write("Scenario 2");
o = {valueOf: function(){write("Inside valueOf"); return 1;}};
write(o==true);
write(o==false);
write(true==o);
write(false==o);


write("Scenario 3");
var o = {valueOf: function(){write("Inside valueOf"); return 0;}};
write(o==true);
write(o==false);
write(true==o);
write(false==o);

write("Scenario 4");
o = {toString: function(){write("Inside toString"); return "1";}};
write(o==true);
write(o==false);
write(true==o);
write(false==o);

write("Scenario 5");
o = {toString: function(){write("Inside toString"); return "0";}};
write(o==true);
write(o==false);
write(true==o);
write(false==o);

write("Scenario 6");
var dtBegin = new Date("Thu Aug 5 05:30:00 PDT 2010");
var dtCurrentBegin=dtBegin.getTime();
write(dtCurrentBegin == dtBegin);
write(dtBegin == dtCurrentBegin);


