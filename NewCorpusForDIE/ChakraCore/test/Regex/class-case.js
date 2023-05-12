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
  WScript.Echo(args);
}

var a = "#$%&";
a+="0123456789";
a+="<=>?@"
a+="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
a+="[\]^_`";
a+="abcdefghijklmnopqrstuvwXYZ";
a+="{|}~";

var regexNoCase =
    [   /[K-Z]+/gi,
        /[C-\{]+/gi,
        /[L-e]+/gi,
        /[F-e]+/gi,
        /[K-_]+/gi,
        /[e-p]+/gi,
        /[r-\~]+/gi,
        /[9-Z]+/gi,
        /[9-k]+/gi,
        /[\]-k]+/gi,
        /[\{-\}]+/gi,
        /[0-z]+/gi,
        /[0-K]+/gi,
        /[5-\}]+/gi,
        /[a-zA-Z]+/gi,
        /[afkl]+/gi,
        /[a-z0-9_]+/gi,
        /[abc]+/gi,
        /[E-f]+/gi,
        /[abc]+/gi,
        /[E-fk-o]+/gi,
        /[a-dk-lx-z]+/gi,
        /[\[\]]+/gi,
        /[\[\}]+/gi,
        /[0-\}]+/gi,
        /[A-z]+/gi,
        /[@-k]+/gi,
        /[0-_]+/gi,
        /[Z-z]+/gi,
        /[A-a]+/gi,
        /[X-kK-b]+/gi

         ];

var regexCase =
    [   /[K-Z]+/g,
        /[C-\{]+/g,
        /[L-e]+/g,
        /[F-e]+/g,
        /[K-_]+/g,
        /[e-p]+/g,
        /[r-\~]+/g,
        /[9-Z]+/g,
        /[9-k]+/g,
        /[\]-k]+/g,
        /[\{-\}]+/g,
        /[0-z]+/g,
        /[0-K]+/g,
        /[5-\}]+/g,
        /[a-zA-Z]+/g,
        /[afkl]+/g,
        /[a-z0-9_]+/g,
        /[abc]+/g,
        /[E-f]+/g,
        /[abc]+/g,
        /[E-fk-o]+/g,
        /[a-dk-lx-z]+/g,
        /[\[\]]+/g,
        /[\[\}]+/g,
        /[0-\}]+/g,
        /[A-z]+/g,
        /[@-k]+/g,
        /[0-_]+/g,
        /[Z-z]+/g,
        /[A-a]+/g,
        /[X-kK-b]+/g

       ];

write("Scenario RegEx case insensitive...");

var count = 1;

for (var i in regexNoCase)
{
   write("Test case " + count + " " + regexNoCase[i] + " - exec :" + regexNoCase[i].exec(a));
   count++;
   write("Test case " + count + " " + regexNoCase[i] + " - match:" + a.match(regexNoCase[i]));
   count++;
}

write("Scenario RegEx case sensitive...");

for (var j in regexCase)
{
   write("Test case " + count + " " + regexCase[j] + " - exec :" + regexCase[j].exec(a));
   count++;
   write("Test case " + count + " " + regexCase[j] + " - match:" + a.match(regexCase[j]));
   count++;
}

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
  WScript.Echo(args);
}

var a = "#$%&";
a+="0123456789";
a+="<=>?@"
a+="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
a+="[\]^_`";
a+="abcdefghijklmnopqrstuvwXYZ";
a+="{|}~";

var regexNoCase =
    [   /[K-Z]+/gi,
        /[C-\{]+/gi,
        /[L-e]+/gi,
        /[F-e]+/gi,
        /[K-_]+/gi,
        /[e-p]+/gi,
        /[r-\~]+/gi,
        /[9-Z]+/gi,
        /[9-k]+/gi,
        /[\]-k]+/gi,
        /[\{-\}]+/gi,
        /[0-z]+/gi,
        /[0-K]+/gi,
        /[5-\}]+/gi,
        /[a-zA-Z]+/gi,
        /[afkl]+/gi,
        /[a-z0-9_]+/gi,
        /[abc]+/gi,
        /[E-f]+/gi,
        /[abc]+/gi,
        /[E-fk-o]+/gi,
        /[a-dk-lx-z]+/gi,
        /[\[\]]+/gi,
        /[\[\}]+/gi,
        /[0-\}]+/gi,
        /[A-z]+/gi,
        /[@-k]+/gi,
        /[0-_]+/gi,
        /[Z-z]+/gi,
        /[A-a]+/gi,
        /[X-kK-b]+/gi

         ];

var regexCase =
    [   /[K-Z]+/g,
        /[C-\{]+/g,
        /[L-e]+/g,
        /[F-e]+/g,
        /[K-_]+/g,
        /[e-p]+/g,
        /[r-\~]+/g,
        /[9-Z]+/g,
        /[9-k]+/g,
        /[\]-k]+/g,
        /[\{-\}]+/g,
        /[0-z]+/g,
        /[0-K]+/g,
        /[5-\}]+/g,
        /[a-zA-Z]+/g,
        /[afkl]+/g,
        /[a-z0-9_]+/g,
        /[abc]+/g,
        /[E-f]+/g,
        /[abc]+/g,
        /[E-fk-o]+/g,
        /[a-dk-lx-z]+/g,
        /[\[\]]+/g,
        /[\[\}]+/g,
        /[0-\}]+/g,
        /[A-z]+/g,
        /[@-k]+/g,
        /[0-_]+/g,
        /[Z-z]+/g,
        /[A-a]+/g,
        /[X-kK-b]+/g

       ];

write("Scenario RegEx case insensitive...");

var count = 1;

for (var i in regexNoCase)
{
   write("Test case " + count + " " + regexNoCase[i] + " - exec :" + regexNoCase[i].exec(a));
   count++;
   write("Test case " + count + " " + regexNoCase[i] + " - match:" + a.match(regexNoCase[i]));
   count++;
}

write("Scenario RegEx case sensitive...");

for (var j in regexCase)
{
   write("Test case " + count + " " + regexCase[j] + " - exec :" + regexCase[j].exec(a));
   count++;
   write("Test case " + count + " " + regexCase[j] + " - match:" + a.match(regexCase[j]));
   count++;
}

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
  WScript.Echo(args);
}

var a = "#$%&";
a+="0123456789";
a+="<=>?@"
a+="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
a+="[\]^_`";
a+="abcdefghijklmnopqrstuvwXYZ";
a+="{|}~";

var regexNoCase =
    [   /[K-Z]+/gi,
        /[C-\{]+/gi,
        /[L-e]+/gi,
        /[F-e]+/gi,
        /[K-_]+/gi,
        /[e-p]+/gi,
        /[r-\~]+/gi,
        /[9-Z]+/gi,
        /[9-k]+/gi,
        /[\]-k]+/gi,
        /[\{-\}]+/gi,
        /[0-z]+/gi,
        /[0-K]+/gi,
        /[5-\}]+/gi,
        /[a-zA-Z]+/gi,
        /[afkl]+/gi,
        /[a-z0-9_]+/gi,
        /[abc]+/gi,
        /[E-f]+/gi,
        /[abc]+/gi,
        /[E-fk-o]+/gi,
        /[a-dk-lx-z]+/gi,
        /[\[\]]+/gi,
        /[\[\}]+/gi,
        /[0-\}]+/gi,
        /[A-z]+/gi,
        /[@-k]+/gi,
        /[0-_]+/gi,
        /[Z-z]+/gi,
        /[A-a]+/gi,
        /[X-kK-b]+/gi

         ];

var regexCase =
    [   /[K-Z]+/g,
        /[C-\{]+/g,
        /[L-e]+/g,
        /[F-e]+/g,
        /[K-_]+/g,
        /[e-p]+/g,
        /[r-\~]+/g,
        /[9-Z]+/g,
        /[9-k]+/g,
        /[\]-k]+/g,
        /[\{-\}]+/g,
        /[0-z]+/g,
        /[0-K]+/g,
        /[5-\}]+/g,
        /[a-zA-Z]+/g,
        /[afkl]+/g,
        /[a-z0-9_]+/g,
        /[abc]+/g,
        /[E-f]+/g,
        /[abc]+/g,
        /[E-fk-o]+/g,
        /[a-dk-lx-z]+/g,
        /[\[\]]+/g,
        /[\[\}]+/g,
        /[0-\}]+/g,
        /[A-z]+/g,
        /[@-k]+/g,
        /[0-_]+/g,
        /[Z-z]+/g,
        /[A-a]+/g,
        /[X-kK-b]+/g

       ];

write("Scenario RegEx case insensitive...");

var count = 1;

for (var i in regexNoCase)
{
   write("Test case " + count + " " + regexNoCase[i] + " - exec :" + regexNoCase[i].exec(a));
   count++;
   write("Test case " + count + " " + regexNoCase[i] + " - match:" + a.match(regexNoCase[i]));
   count++;
}

write("Scenario RegEx case sensitive...");

for (var j in regexCase)
{
   write("Test case " + count + " " + regexCase[j] + " - exec :" + regexCase[j].exec(a));
   count++;
   write("Test case " + count + " " + regexCase[j] + " - match:" + a.match(regexCase[j]));
   count++;
}

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
  WScript.Echo(args);
}

var a = "#$%&";
a+="0123456789";
a+="<=>?@"
a+="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
a+="[\]^_`";
a+="abcdefghijklmnopqrstuvwXYZ";
a+="{|}~";

var regexNoCase =
    [   /[K-Z]+/gi,
        /[C-\{]+/gi,
        /[L-e]+/gi,
        /[F-e]+/gi,
        /[K-_]+/gi,
        /[e-p]+/gi,
        /[r-\~]+/gi,
        /[9-Z]+/gi,
        /[9-k]+/gi,
        /[\]-k]+/gi,
        /[\{-\}]+/gi,
        /[0-z]+/gi,
        /[0-K]+/gi,
        /[5-\}]+/gi,
        /[a-zA-Z]+/gi,
        /[afkl]+/gi,
        /[a-z0-9_]+/gi,
        /[abc]+/gi,
        /[E-f]+/gi,
        /[abc]+/gi,
        /[E-fk-o]+/gi,
        /[a-dk-lx-z]+/gi,
        /[\[\]]+/gi,
        /[\[\}]+/gi,
        /[0-\}]+/gi,
        /[A-z]+/gi,
        /[@-k]+/gi,
        /[0-_]+/gi,
        /[Z-z]+/gi,
        /[A-a]+/gi,
        /[X-kK-b]+/gi

         ];

var regexCase =
    [   /[K-Z]+/g,
        /[C-\{]+/g,
        /[L-e]+/g,
        /[F-e]+/g,
        /[K-_]+/g,
        /[e-p]+/g,
        /[r-\~]+/g,
        /[9-Z]+/g,
        /[9-k]+/g,
        /[\]-k]+/g,
        /[\{-\}]+/g,
        /[0-z]+/g,
        /[0-K]+/g,
        /[5-\}]+/g,
        /[a-zA-Z]+/g,
        /[afkl]+/g,
        /[a-z0-9_]+/g,
        /[abc]+/g,
        /[E-f]+/g,
        /[abc]+/g,
        /[E-fk-o]+/g,
        /[a-dk-lx-z]+/g,
        /[\[\]]+/g,
        /[\[\}]+/g,
        /[0-\}]+/g,
        /[A-z]+/g,
        /[@-k]+/g,
        /[0-_]+/g,
        /[Z-z]+/g,
        /[A-a]+/g,
        /[X-kK-b]+/g

       ];

write("Scenario RegEx case insensitive...");

var count = 1;

for (var i in regexNoCase)
{
   write("Test case " + count + " " + regexNoCase[i] + " - exec :" + regexNoCase[i].exec(a));
   count++;
   write("Test case " + count + " " + regexNoCase[i] + " - match:" + a.match(regexNoCase[i]));
   count++;
}

write("Scenario RegEx case sensitive...");

for (var j in regexCase)
{
   write("Test case " + count + " " + regexCase[j] + " - exec :" + regexCase[j].exec(a));
   count++;
   write("Test case " + count + " " + regexCase[j] + " - match:" + a.match(regexCase[j]));
   count++;
}
