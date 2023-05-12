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
Below test cases verifies the combination of sticky+multiline flag  when used.
*/
var testCount = 0;
function test(re, str, lastIndex, loopCount) 
{
    var formattedStr = str.replace('\n', '\\n');
    WScript.Echo('********** Test #' + ++testCount + " **********");
    
    re.lastIndex = lastIndex;
    for(var i = 0; i < loopCount; i++) {
        WScript.Echo(' ***   Iteration#' + (i+1))
        WScript.Echo(' var re=' + re);
        WScript.Echo(' var str=\'' + formattedStr + '\'');
        WScript.Echo(' re.lastIndex = '+re.lastIndex);
        WScript.Echo(' Result = ' + re.exec(str));
        WScript.Echo(' re.lastIndex = ' + re.lastIndex);
    }
}

 // no-^, /y
 test(/b12/y, "b12asd\nb12", 1, 4);
 test(/b12/y, "ab12asd\nb12", 1, 4);
 test(/b/y, "ab", 1, 4);
 test(/abc/y, "abcabcababc", 3, 4);

 // no-^, /my
 test(/b12/my, "ab12asd\nb12", 0, 4); 
 test(/b12/my, "ab12asd\nb12", 1, 4); 
 test(/b12/my, "b12asd\nb12", 1, 4);

 // ^, /y
 test(/^b12/y, "b12asd\nb12", 1, 4);
 test(/^b12/y, "ab12asd\nb12", 0, 4); 
 test(/^b12/y, "ab12asd\nb12", 1, 4); 
 test(/^b12/y, "b12b12", 3, 4); 
 test(/a|^b/gy, "baba", 0, 4); 

 // ^, /my
 test(/^b12/my, "b12asd\nb12", 0, 4); 
 test(/^b12/my, "b12asd\nb12", 1, 4); 
 test(/^b12/my, "b12asd\nb12", 7, 4); 
 test(/^b12/my, "asdsa123asd\nb12", 1, 4); 
 test(/^b12/my, "ab12asd\nb12", 1, 4); 
 test(/^b12/my, "ab12asd\nb12", 0, 4); 
 test(/^b/my, "a\nb", 2, 4);

WScript.Echo("abc\ndef\nghi\njkl\nmno\npqr\nstu\nvwx\nyz".match(/^.*\n/myg));

// BOILiteral2
 test(/^ba/my, "ba\nba", 0, 4);
 test(/^ba/my, "ba\nba", 1, 4);

// BoundedWordTag
 test(/\b\w+\b/y, "( ab )", 0, 4);
 test(/\b\w+\b/y, "( ab )", 2, 4);

// SingleCharTag
 test(/b/my, "ba\nb", 0, 4);
 test(/b/my, "ba\nb", 1, 4);
 test(/b/y, "ba\nb", 0, 4);
 test(/b/y, "ba\nb", 1, 4);
 test(/b/y, "a\nb", 0, 4);
 test(/b/my, "a\nb", 0, 4);

//LeadingTrailingSpacesTag (already taken care because of trailing ^)
 var re = /^\s*|\s*$/;
 test(/^\s*|\s*$/y, " ab", 1, 1);
