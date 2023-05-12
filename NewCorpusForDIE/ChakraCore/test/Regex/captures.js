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

// Test of regex captures with some examples motivated by WAC.

WScript.Echo(/(ab)|(ac)/.exec("aabc"));
WScript.Echo(/(ab)|(ac)+/.exec("qacbacacd"));
WScript.Echo(/(ab)+|(ac)+/.exec("qababacacd"));
WScript.Echo(/(?:ab)+|(ac)+/.exec("qababacacd"));
WScript.Echo(/(?:ab)+|(?:ac)+/.exec("qababacacd"));

var a = new RegExp('^([^?]+)');
var a1 = a.exec("file://d:\\foo.txt");
WScript.Echo(a1);

var b = new RegExp('^([a-z+.-]+://(?:[^/]*/)*)[^/]*$');
var b1 = b.exec("file://d:\\foo.txt");
WScript.Echo(b1);

var c = b.exec(a.exec("file://d:\\foo.txt")[1])[1];
WScript.Echo(c);

var http = "http://ezedev/WAC/onenoteframe.aspx?Fi=c%3A%5CViewingData%5Cbasefile%5CTest&H=ol&C=0__ezedev&ui=en-US";
WScript.Echo(a.exec(http));
WScript.Echo(b.exec(a.exec(http)[1]));
var d = b.exec(a.exec(http)[1])[1];
WScript.Echo(d);

var d = 'foo bar'.replace(/(foo)|(bar)/g, '[$1$2]');
WScript.Echo(d+"");

var e = "ab".replace(/(.)(.){0}/,'$1$2');
WScript.Echo(e+"");


var groups = {};

function Assert(actual, expected, category, notStrict)
{
    if (!groups[category]) {
        groups[category] = 1;
    } else {
        groups[category]++;
    }

    var condition = (actual === expected);
    if (!!notStrict) {
        condition = (actual == expected)
    }

    if (!condition) {
        WScript.Echo(category + " test " + groups[category] + " failed. Expected: " + expected + ", Actual: " + actual);
    } else {
        WScript.Echo(category + " test " + groups[category] + " passed");
    }
}

var needle = /(bc)/;
var haystack = "abcdef";

haystack.match(needle);
Assert(RegExp.$1, "bc", "numberedRegex", true);
Assert(RegExp.$2, "", "numberedRegex");

needle = /xy/;
haystack.match(needle);
Assert(RegExp.$1, "bc", "numberedRegex");
Assert(RegExp.$2, "", "numberedRegex");
