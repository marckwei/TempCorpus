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
// Copyright (c) ChakraCore Project Contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

var testString = "tacgattttatcgcgactagttaatcatcatagcaagtaaaatttgaattatgtcattat\
catgctccattaacaggttatttaattgatactgacgaaattttttcacaatgggttttc\
tagaatttaatatcagtaattgaagccttcataggggtcctactagtatcctacacgacg\
caggtccgcagtatcctggagggacgtgttactgattaaaagggtcaaaggaatgaaggc\
tcacaatgttacctgcttcaccatagtgagccgatgagttttacattagtactaaatccc\
aaatcatactttacgatgaggcttgctagcgctaaagagaatacatacaccaccacatag\
aattgttagcgatgatatcaaatagactcctggaagtgtcagggggaaactgttcaatat\
ttcgtccacaggactgaccaggcatggaaaagactgacgttggaaactataccatctcac\
gcccgacgcttcactaattgatgatccaaaaaatatagcccggattcctgattagcaaag\
ggttcacagagaaagatattatcgacgtatatcccaaaaaacagacgtaatgtgcatctt\
cgaatcgggatgaatacttgtatcataaaaatgtgacctctagtatacaggttaatgtta\
ctcacccacgtatttggtctaattatgttttatttagtgacaatccaatagataaccggt\
cctattaagggctatatttttagcgaccacgcgtttaaacaaaggattgtatgtagatgg\
gcttgatataagatttcggatgtatgggttttataatcgttggagagctcaatcatgagc\
taatacatggatttcgctacctcaccgagagaccttgcatgaagaattctaaccaaaagt\
ttaataggccggattggattgagttaattaagaccttgttcagtcatagtaaaaaccctt\n\
aaattttaccgattgacaaagtgagcagtcgcaataccctatgcgaaacgcctcgatagt\n\
gactaggtatacaaggtttttgagttcctttgaaatagttaactaatttaaaattaatta\n\
acgacatggaaatcacagaacctaatgctttgtaggagttatttatgctgtttactgcct\n\
ctacaaccctaataaagcagtcctaagaatgaaacgcatcttttagttcagaaagtggta\n\
tccagggtggtcaatttaataaattcaacatcgggtctcaggatattcggtcatataatt\n\
tattaagggctcttcgagtcttactctgagtgaaattggaaacagtcatccttttcgttg\n\
tgaggcatcttacaccgctatcgatatacaatgcattccaccgcggtgtcccgtacacaa\n\
ggaaacttgttaccttggggatataagaaaactcacacgtctcattattaaactgagtac\n\
tggaacgcacctcggatctgttgcactggattaaaatccgattatttttaaaaatattca\n\
gtgctagagcatatcaggtctacttttttatctggtatgtaaagcccacggagcgatagt\n\
gagatccttacgactcaacgaaaagttataacataactcccgttagccaaagcccaatcc\n\
\n";
testString = testString + testString + testString;
testString = testString + testString + testString;
testString = testString + testString + testString;
testString = testString + testString + testString;
var seqs = [/a|tttaccct/ig];

Array.prototype.push.call(seqs, false, Array.prototype.concat.call(seqs, seqs, testString));
try {
  for (i in seqs) {
    testString.match(seqs[i]);
  }
  print ("Test should produce Stack over flow but didn't, case may need amending")
}
catch(e) {
  if (e == "Error: Out of stack space") {
    print ("pass")
  } else {
    print ("Wrong error thrown, expected \"Error: Out of stack space\" but recieved \"" + e + "\"");
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
// Copyright (c) ChakraCore Project Contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

var testString = "tacgattttatcgcgactagttaatcatcatagcaagtaaaatttgaattatgtcattat\
catgctccattaacaggttatttaattgatactgacgaaattttttcacaatgggttttc\
tagaatttaatatcagtaattgaagccttcataggggtcctactagtatcctacacgacg\
caggtccgcagtatcctggagggacgtgttactgattaaaagggtcaaaggaatgaaggc\
tcacaatgttacctgcttcaccatagtgagccgatgagttttacattagtactaaatccc\
aaatcatactttacgatgaggcttgctagcgctaaagagaatacatacaccaccacatag\
aattgttagcgatgatatcaaatagactcctggaagtgtcagggggaaactgttcaatat\
ttcgtccacaggactgaccaggcatggaaaagactgacgttggaaactataccatctcac\
gcccgacgcttcactaattgatgatccaaaaaatatagcccggattcctgattagcaaag\
ggttcacagagaaagatattatcgacgtatatcccaaaaaacagacgtaatgtgcatctt\
cgaatcgggatgaatacttgtatcataaaaatgtgacctctagtatacaggttaatgtta\
ctcacccacgtatttggtctaattatgttttatttagtgacaatccaatagataaccggt\
cctattaagggctatatttttagcgaccacgcgtttaaacaaaggattgtatgtagatgg\
gcttgatataagatttcggatgtatgggttttataatcgttggagagctcaatcatgagc\
taatacatggatttcgctacctcaccgagagaccttgcatgaagaattctaaccaaaagt\
ttaataggccggattggattgagttaattaagaccttgttcagtcatagtaaaaaccctt\n\
aaattttaccgattgacaaagtgagcagtcgcaataccctatgcgaaacgcctcgatagt\n\
gactaggtatacaaggtttttgagttcctttgaaatagttaactaatttaaaattaatta\n\
acgacatggaaatcacagaacctaatgctttgtaggagttatttatgctgtttactgcct\n\
ctacaaccctaataaagcagtcctaagaatgaaacgcatcttttagttcagaaagtggta\n\
tccagggtggtcaatttaataaattcaacatcgggtctcaggatattcggtcatataatt\n\
tattaagggctcttcgagtcttactctgagtgaaattggaaacagtcatccttttcgttg\n\
tgaggcatcttacaccgctatcgatatacaatgcattccaccgcggtgtcccgtacacaa\n\
ggaaacttgttaccttggggatataagaaaactcacacgtctcattattaaactgagtac\n\
tggaacgcacctcggatctgttgcactggattaaaatccgattatttttaaaaatattca\n\
gtgctagagcatatcaggtctacttttttatctggtatgtaaagcccacggagcgatagt\n\
gagatccttacgactcaacgaaaagttataacataactcccgttagccaaagcccaatcc\n\
\n";
testString = testString + testString + testString;
testString = testString + testString + testString;
testString = testString + testString + testString;
testString = testString + testString + testString;
var seqs = [/a|tttaccct/ig];

Array.prototype.push.call(seqs, false, Array.prototype.concat.call(seqs, seqs, testString));
try {
  for (i in seqs) {
    testString.match(seqs[i]);
  }
  print ("Test should produce Stack over flow but didn't, case may need amending")
}
catch(e) {
  if (e == "Error: Out of stack space") {
    print ("pass")
  } else {
    print ("Wrong error thrown, expected \"Error: Out of stack space\" but recieved \"" + e + "\"");
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
// Copyright (c) ChakraCore Project Contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

var testString = "tacgattttatcgcgactagttaatcatcatagcaagtaaaatttgaattatgtcattat\
catgctccattaacaggttatttaattgatactgacgaaattttttcacaatgggttttc\
tagaatttaatatcagtaattgaagccttcataggggtcctactagtatcctacacgacg\
caggtccgcagtatcctggagggacgtgttactgattaaaagggtcaaaggaatgaaggc\
tcacaatgttacctgcttcaccatagtgagccgatgagttttacattagtactaaatccc\
aaatcatactttacgatgaggcttgctagcgctaaagagaatacatacaccaccacatag\
aattgttagcgatgatatcaaatagactcctggaagtgtcagggggaaactgttcaatat\
ttcgtccacaggactgaccaggcatggaaaagactgacgttggaaactataccatctcac\
gcccgacgcttcactaattgatgatccaaaaaatatagcccggattcctgattagcaaag\
ggttcacagagaaagatattatcgacgtatatcccaaaaaacagacgtaatgtgcatctt\
cgaatcgggatgaatacttgtatcataaaaatgtgacctctagtatacaggttaatgtta\
ctcacccacgtatttggtctaattatgttttatttagtgacaatccaatagataaccggt\
cctattaagggctatatttttagcgaccacgcgtttaaacaaaggattgtatgtagatgg\
gcttgatataagatttcggatgtatgggttttataatcgttggagagctcaatcatgagc\
taatacatggatttcgctacctcaccgagagaccttgcatgaagaattctaaccaaaagt\
ttaataggccggattggattgagttaattaagaccttgttcagtcatagtaaaaaccctt\n\
aaattttaccgattgacaaagtgagcagtcgcaataccctatgcgaaacgcctcgatagt\n\
gactaggtatacaaggtttttgagttcctttgaaatagttaactaatttaaaattaatta\n\
acgacatggaaatcacagaacctaatgctttgtaggagttatttatgctgtttactgcct\n\
ctacaaccctaataaagcagtcctaagaatgaaacgcatcttttagttcagaaagtggta\n\
tccagggtggtcaatttaataaattcaacatcgggtctcaggatattcggtcatataatt\n\
tattaagggctcttcgagtcttactctgagtgaaattggaaacagtcatccttttcgttg\n\
tgaggcatcttacaccgctatcgatatacaatgcattccaccgcggtgtcccgtacacaa\n\
ggaaacttgttaccttggggatataagaaaactcacacgtctcattattaaactgagtac\n\
tggaacgcacctcggatctgttgcactggattaaaatccgattatttttaaaaatattca\n\
gtgctagagcatatcaggtctacttttttatctggtatgtaaagcccacggagcgatagt\n\
gagatccttacgactcaacgaaaagttataacataactcccgttagccaaagcccaatcc\n\
\n";
testString = testString + testString + testString;
testString = testString + testString + testString;
testString = testString + testString + testString;
testString = testString + testString + testString;
var seqs = [/a|tttaccct/ig];

Array.prototype.push.call(seqs, false, Array.prototype.concat.call(seqs, seqs, testString));
try {
  for (i in seqs) {
    testString.match(seqs[i]);
  }
  print ("Test should produce Stack over flow but didn't, case may need amending")
}
catch(e) {
  if (e == "Error: Out of stack space") {
    print ("pass")
  } else {
    print ("Wrong error thrown, expected \"Error: Out of stack space\" but recieved \"" + e + "\"");
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
// Copyright (c) ChakraCore Project Contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

var testString = "tacgattttatcgcgactagttaatcatcatagcaagtaaaatttgaattatgtcattat\
catgctccattaacaggttatttaattgatactgacgaaattttttcacaatgggttttc\
tagaatttaatatcagtaattgaagccttcataggggtcctactagtatcctacacgacg\
caggtccgcagtatcctggagggacgtgttactgattaaaagggtcaaaggaatgaaggc\
tcacaatgttacctgcttcaccatagtgagccgatgagttttacattagtactaaatccc\
aaatcatactttacgatgaggcttgctagcgctaaagagaatacatacaccaccacatag\
aattgttagcgatgatatcaaatagactcctggaagtgtcagggggaaactgttcaatat\
ttcgtccacaggactgaccaggcatggaaaagactgacgttggaaactataccatctcac\
gcccgacgcttcactaattgatgatccaaaaaatatagcccggattcctgattagcaaag\
ggttcacagagaaagatattatcgacgtatatcccaaaaaacagacgtaatgtgcatctt\
cgaatcgggatgaatacttgtatcataaaaatgtgacctctagtatacaggttaatgtta\
ctcacccacgtatttggtctaattatgttttatttagtgacaatccaatagataaccggt\
cctattaagggctatatttttagcgaccacgcgtttaaacaaaggattgtatgtagatgg\
gcttgatataagatttcggatgtatgggttttataatcgttggagagctcaatcatgagc\
taatacatggatttcgctacctcaccgagagaccttgcatgaagaattctaaccaaaagt\
ttaataggccggattggattgagttaattaagaccttgttcagtcatagtaaaaaccctt\n\
aaattttaccgattgacaaagtgagcagtcgcaataccctatgcgaaacgcctcgatagt\n\
gactaggtatacaaggtttttgagttcctttgaaatagttaactaatttaaaattaatta\n\
acgacatggaaatcacagaacctaatgctttgtaggagttatttatgctgtttactgcct\n\
ctacaaccctaataaagcagtcctaagaatgaaacgcatcttttagttcagaaagtggta\n\
tccagggtggtcaatttaataaattcaacatcgggtctcaggatattcggtcatataatt\n\
tattaagggctcttcgagtcttactctgagtgaaattggaaacagtcatccttttcgttg\n\
tgaggcatcttacaccgctatcgatatacaatgcattccaccgcggtgtcccgtacacaa\n\
ggaaacttgttaccttggggatataagaaaactcacacgtctcattattaaactgagtac\n\
tggaacgcacctcggatctgttgcactggattaaaatccgattatttttaaaaatattca\n\
gtgctagagcatatcaggtctacttttttatctggtatgtaaagcccacggagcgatagt\n\
gagatccttacgactcaacgaaaagttataacataactcccgttagccaaagcccaatcc\n\
\n";
testString = testString + testString + testString;
testString = testString + testString + testString;
testString = testString + testString + testString;
testString = testString + testString + testString;
var seqs = [/a|tttaccct/ig];

Array.prototype.push.call(seqs, false, Array.prototype.concat.call(seqs, seqs, testString));
try {
  for (i in seqs) {
    testString.match(seqs[i]);
  }
  print ("Test should produce Stack over flow but didn't, case may need amending")
}
catch(e) {
  if (e == "Error: Out of stack space") {
    print ("pass")
  } else {
    print ("Wrong error thrown, expected \"Error: Out of stack space\" but recieved \"" + e + "\"");
  }
}
