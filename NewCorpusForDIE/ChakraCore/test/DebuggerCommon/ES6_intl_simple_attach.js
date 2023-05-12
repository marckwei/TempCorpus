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

/*
    Intl Object
    Intl Collator
    Intl Number Format
    Intl DateTime Format
    Chakra Implementation should be hidden from the user
*/

function Run() {
    var coll = Intl.Collator();
    var numFormat = Intl.NumberFormat();
    var dttmFormat = Intl.DateTimeFormat();

    WScript.Echo('PASSED');/**bp:
    locals(1);
    evaluate('coll',4);
    evaluate('numFormat',4);
    evaluate('dttmFormat',4);
    evaluate('coll.compare.toString() == \'function() {\\n    [native code]\\n}\'');
    evaluate('coll.resolvedOptions.toString() == \'function() {\\n    [native code]\\n}\'');
    evaluate('numFormat.format.toString() == \'function() {\\n    [native code]\\n}\'');
    evaluate('numFormat.resolvedOptions.toString() == \'function() {\\n    [native code]\\n}\'');
    evaluate('dttmFormat.format.toString() == \'function() {\\n    [native code]\\n}\'');
    evaluate('dttmFormat.resolvedOptions.toString() == \'function() {\\n    [native code]\\n}\'');
    **/
}

var x; /**bp:evaluate('Intl.Collator')**/
WScript.Attach(Run);
WScript.Detach(Run);

