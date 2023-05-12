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

var sources = [
    "/(?:)/",
    "",
    "(?:)",

    "/a\\tb/",
    "a\tb",
    "a\\tb",

    "/a\\nb/",
    "a\nb",
    "a\\nb",

    "/a\\x0ab/",
    "a\x0ab",
    "a\\x0ab",

    "/a\\u000ab/",
    "a\u000ab",
    "a\\u000ab"
];
var sourceIndex = 0;

var flags = ["g", "i", "m", "gi", "ig", "gm", "mg", "im", "mi", "gim", "gmi", "igm", "img", "mgi", "mig"];
var flagIndex = 0;

var n = Math.max(sources.length, flags.length);
for(var i = 0; i < n; ++i) {
    var s = sources[sourceIndex++ % sources.length];
    var f = flags[flagIndex++ % flags.length];
    var r;
    if(s.charAt(0) === "/")
        r = eval(s + f);
    else
        r = new RegExp(s, f);
    runTest(r);
}

function runTest(r) {
    echo(r.source);
    echo(r.toString());
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function echo() {
    var doEcho;
    if(this.WScript)
        doEcho = function (s) { this.WScript.Echo(s); };
    else if(this.document)
        doEcho = function (s) {
            var div = this.document.createElement("div");
            div.innerText = s;
            this.document.body.appendChild(div);
        };
    else
        doEcho = function (s) { this.print(s); };
    echo = function () {
        var s = "";
        for(var i = 0; i < arguments.length; ++i)
            s += arguments[i];
        doEcho(s);
    };
    echo.apply(this, arguments);
}
