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

﻿//-------------------------------------------------------------------------------------------------------
// Copyright (C) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE.txt file in the project root for full license information.
//-------------------------------------------------------------------------------------------------------

eval('function 㹭(殳) { return this }; 㹭(); /* \r\n(function()\r\n{\r\n            while(function 㹭掠寢繴ⳍ溜ⳡ슯椑닓臎쥤뻹䧘䵯짣슢ⱨ慸娙뚍憣踟蚛ꆏ뺂ꁀ㗜㕎(殳扠斾듌瘗㘩윖瑆鐌璊ꃽ촩瘿頨䩬)\r\n    {\r\n                if(arguments[0])\r\n        {\r\n                        this.㰔㲈ኒ䯱鐕낢Ẵꐕ沆왨峣瞛呢囡礰느뱮셒鑐䄮䔪솇硄쮈笥礫隳ߦ齫긢䐚럞j蛈䏆ゔ싣䛵嘣 = "use ￅ潳䔟꺡팛ӡｗῘY瑑茥獷詺ጤ쎫ጰ倶わ彦溫ţ홵曇ㅎ펉쵳祦ꆍ珶奅砏ꥁს뢆쇯ቷ梏굮瞙㡩奊鉸睯꾎쒖ဌ毴㿶챱츉䱎菌懐ﾀ鑦鬕鸃槮㽔砉鵶尴飔㧰廛㫻礖짗揪㶢刖㧫竕䑯疡촫身ھ쯕砘垆쓤"\r\n        }\r\n                this.㰔㲈ኒ䯱鐕낢Ẵꐕ沆왨峣瞛呢囡礰느뱮셒鑐䄮䔪솇硄쮈笥礫隳ߦ齫긢䐚럞j蛈䏆ゔ싣䛵嘣 = {Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较:3};\r\n        (function()\r\n        {\r\n                        return this\r\n        })();\r\n        this.㰔㲈ኒ䯱鐕낢Ẵꐕ沆왨峣瞛呢囡礰느뱮셒鑐䄮䔪솇硄쮈笥礫隳ߦ齫긢䐚럞j蛈䏆ゔ싣䛵嘣 = function 瀹䲌犕鋛贤뇋쾏鸓嶞વ韹ҡ鮖ꍁ笗䣾搗趌춉鈕渚훗ጟ䚅殖妝遪㖋쓲蠠ꙛ핁菵滅윴둄䧌Å遝Ṧ畔뼀䫀蛮(Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较)\r\n        {\r\n                        return{getOwnPropertyDescriptor:function(name)\r\n            {\r\n                                var 䎰으뢳녤鼟㹜琷ꩂ䖌萌䏓咉餕㚫 = "쥓ꐦ똨䴯텩Ꚕὒ짣䑯쉹ᆐ彎と勽믊п粸둥㫬偂첥鳊ᦓᒌכּ凯娓ꋍέ풢먨鞇腙畩螅낄ዏ撽叨曈씓ǂ犛썽";\r\n                殧펕劬㩶䫁鋦화뀯슏夺鹥詧㵳柨䣡ډ㷡呿凉隖項č펍젂鵪㫳辇旂퇗ꎸ羠擝ᥡങ阡廃ﲕꍽ嶢뎑㾽룢隌揄믏灭ໝ卅阐졂ꔨ崚빀浲衁ᒔ엲繺뛅櫫몲鄞쀅㹞묆ṅዢ馅橐럩嶑벚䋜咳䔎릛聊㹔㘋할셃캭笯㿛鯜頿矋멑䨸郞岫桡훌飼鐕疣힃㾻뗾ꁳウ(䎰으뢳녤鼟㹜琷ꩂ䖌萌䏓咉餕㚫 + "ṕ뫣ᰌ懆疞妡ｉ㘑ᦙꔭ띯뷧蔽匡趚쨷쑙: getOwnPropertyDescriptor");\r\n                var 法䜥쿚鸨헺䂞ښ愭娕統뜭ᰂბ筐ㄜ㥳䶁쬴ⵈ怽垳ꖷ䎙溒뙏닑闂觇愡ỵጴ켲쏲絈红襈툥讅햯홭긴뉥䮕射湵ᕀ鮼麾撵즚㬰ꢱ錿惣ᶔꇽꏆ쪟鈻眘팻䆞띝敃Ⳇ杍쇻四눈殔ኍ䟙鶑暴ﱬ啛ゲ鑝殳ଏ딂甇잱硙뜘꿽滵ﵧޞ䖫凖絗涑轰寬ⴎꜲ窬镘ᬞ蚪탥㰟㜥ꇙ阎義郁謐鉗풩 = Object.getOwnPropertyDescriptor(Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较);\r\n                法䜥쿚鸨헺䂞ښ愭娕統뜭ᰂბ筐ㄜ㥳䶁쬴ⵈ怽垳ꖷ䎙溒뙏닑闂觇愡ỵጴ켲쏲絈红襈툥讅햯홭긴뉥䮕射湵ᕀ鮼麾撵즚㬰ꢱ錿惣ᶔꇽꏆ쪟鈻眘팻䆞띝敃Ⳇ杍쇻四눈殔ኍ䟙鶑暴ﱬ啛ゲ鑝殳ଏ딂甇잱硙뜘꿽滵ﵧޞ䖫凖絗涑轰寬ⴎꜲ窬镘ᬞ蚪탥㰟㜥ꇙ阎義郁謐鉗풩.configurable = true;\r\n                return 法䜥쿚鸨헺䂞ښ愭娕統뜭ᰂბ筐ㄜ㥳䶁쬴ⵈ怽垳ꖷ䎙溒뙏닑闂觇愡ỵጴ켲쏲絈红襈툥讅햯홭긴뉥䮕射湵ᕀ鮼麾撵즚㬰ꢱ錿惣ᶔꇽꏆ쪟鈻眘팻䆞띝敃Ⳇ杍쇻四눈殔ኍ䟙鶑暴ﱬ啛ゲ鑝殳ଏ딂甇잱硙뜘꿽滵ﵧޞ䖫凖絗涑轰寬ⴎꜲ窬镘ᬞ蚪탥㰟㜥ꇙ阎義郁謐鉗풩\r\n            },ᜅ뀭䘣ꂷ诒趝瓇署紡ｆね忭뫊왂ⵡ嬶꿽䬨蛊䇱ꗦ靇쬫㽺鱔댓箧䞛棠䙴㜮맟廚陮乪ᐼⅇﰲ牢ʇ恓㥓㣂㜠ѓ逻渻:function(name)\r\n            {\r\n                                var 䎰으뢳녤鼟㹜琷ꩂ䖌萌䏓咉餕㚫 = "쥓ꐦ똨䴯텩Ꚕὒ짣䑯쉹ᆐ彎と勽믊п粸둥㫬偂첥鳊ᦓᒌכּ凯娓ꋍέ풢먨鞇腙畩螅낄ዏ撽叨曈씓ǂ犛썽";\r\n                殧펕劬㩶䫁鋦화뀯슏夺鹥詧㵳柨䣡ډ㷡呿凉隖項č펍젂鵪㫳辇旂퇗ꎸ羠擝ᥡങ阡廃ﲕꍽ嶢뎑㾽룢隌揄믏灭ໝ卅阐졂ꔨ崚빀浲衁ᒔ엲繺뛅櫫몲鄞쀅㹞묆ṅዢ馅橐럩嶑벚䋜咳䔎릛聊㹔㘋할셃캭笯㿛鯜頿矋멑䨸郞岫桡훌飼鐕疣힃㾻뗾ꁳウ(䎰으뢳녤鼟㹜琷ꩂ䖌萌䏓咉餕㚫 + "ṕ뫣ᰌ懆疞妡ｉ㘑ᦙꔭ띯뷧蔽匡趚쨷쑙: ᜅ뀭䘣ꂷ诒趝瓇署紡ｆね忭뫊왂ⵡ嬶꿽䬨蛊䇱ꗦ靇쬫㽺鱔댓箧䞛棠䙴㜮맟廚陮乪ᐼⅇﰲ牢ʇ恓㥓㣂㜠ѓ逻渻");\r\n                var 法䜥쿚鸨헺䂞ښ愭娕統뜭ᰂბ筐ㄜ㥳䶁쬴ⵈ怽垳ꖷ䎙溒뙏닑闂觇愡ỵጴ켲쏲絈红襈툥讅햯홭긴뉥䮕射湵ᕀ鮼麾撵즚㬰ꢱ錿惣ᶔꇽꏆ쪟鈻眘팻䆞띝敃Ⳇ杍쇻四눈殔ኍ䟙鶑暴ﱬ啛ゲ鑝殳ଏ딂甇잱硙뜘꿽滵ﵧޞ䖫凖絗涑轰寬ⴎꜲ窬镘ᬞ蚪탥㰟㜥ꇙ阎義郁謐鉗풩 = Object.ᜅ뀭䘣ꂷ诒趝瓇署紡ｆね忭뫊왂ⵡ嬶꿽䬨蛊䇱ꗦ靇쬫㽺鱔댓箧䞛棠䙴㜮맟廚陮乪ᐼⅇﰲ牢ʇ恓㥓㣂㜠ѓ逻渻(Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较);\r\n                法䜥쿚鸨헺䂞ښ愭娕統뜭ᰂბ筐ㄜ㥳䶁쬴ⵈ怽垳ꖷ䎙溒뙏닑闂觇愡ỵጴ켲쏲絈红襈툥讅햯홭긴뉥䮕射湵ᕀ鮼麾撵즚㬰ꢱ錿惣ᶔꇽꏆ쪟鈻眘팻䆞띝敃Ⳇ杍쇻四눈殔ኍ䟙鶑暴ﱬ啛ゲ鑝殳ଏ딂甇잱硙뜘꿽滵ﵧޞ䖫凖絗涑轰寬ⴎꜲ窬镘ᬞ蚪탥㰟㜥ꇙ阎義郁謐鉗풩.configurable = true;\r\n                return 法䜥쿚鸨헺䂞ښ愭娕統뜭ᰂბ筐ㄜ㥳䶁쬴ⵈ怽垳ꖷ䎙溒뙏닑闂觇愡ỵጴ켲쏲絈红襈툥讅햯홭긴뉥䮕射湵ᕀ鮼麾撵즚㬰ꢱ錿惣ᶔꇽꏆ쪟鈻眘팻䆞띝敃Ⳇ杍쇻四눈殔ኍ䟙鶑暴ﱬ啛ゲ鑝殳ଏ딂甇잱硙뜘꿽滵ﵧޞ䖫凖絗涑轰寬ⴎꜲ窬镘ᬞ蚪탥㰟㜥ꇙ阎義郁謐鉗풩\r\n            },defineProperty:function(name,法䜥쿚鸨헺䂞ښ愭娕統뜭ᰂბ筐ㄜ㥳䶁쬴ⵈ怽垳ꖷ䎙溒뙏닑闂觇愡ỵጴ켲쏲絈红襈툥讅햯홭긴뉥䮕射湵ᕀ鮼麾撵즚㬰ꢱ錿惣ᶔꇽꏆ쪟鈻眘팻䆞띝敃Ⳇ杍쇻四눈殔ኍ䟙鶑暴ﱬ啛ゲ鑝殳ଏ딂甇잱硙뜘꿽滵ﵧޞ䖫凖絗涑轰寬ⴎꜲ窬镘ᬞ蚪탥㰟㜥ꇙ阎義郁謐鉗풩)\r\n            {\r\n                                var 䎰으뢳녤鼟㹜琷ꩂ䖌萌䏓咉餕㚫 = "쥓ꐦ똨䴯텩Ꚕὒ짣䑯쉹ᆐ彎と勽믊п粸둥㫬偂첥鳊ᦓᒌכּ凯娓ꋍέ풢먨鞇腙畩螅낄ዏ撽叨曈씓ǂ犛썽";\r\n                殧펕劬㩶䫁鋦화뀯슏夺鹥詧㵳柨䣡ډ㷡呿凉隖項č펍젂鵪㫳辇旂퇗ꎸ羠擝ᥡങ阡廃ﲕꍽ嶢뎑㾽룢隌揄믏灭ໝ卅阐졂ꔨ崚빀浲衁ᒔ엲繺뛅櫫몲鄞쀅㹞묆ṅዢ馅橐럩嶑벚䋜咳䔎릛聊㹔㘋할셃캭笯㿛鯜頿矋멑䨸郞岫桡훌飼鐕疣힃㾻뗾ꁳウ(䎰으뢳녤鼟㹜琷ꩂ䖌萌䏓咉餕㚫 + "ṕ뫣ᰌ懆疞妡ｉ㘑ᦙꔭ띯뷧蔽匡趚쨷쑙: defineProperty");\r\n                Object.defineProperty(Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较,arguments[0],arguments[1])\r\n            },getOwnPropertyNames:function()\r\n            {\r\n                                var 䎰으뢳녤鼟㹜琷ꩂ䖌萌䏓咉餕㚫 = "쥓ꐦ똨䴯텩Ꚕὒ짣䑯쉹ᆐ彎と勽믊п粸둥㫬偂첥鳊ᦓᒌכּ凯娓ꋍέ풢먨鞇腙畩螅낄ዏ撽叨曈씓ǂ犛썽";\r\n                殧펕劬㩶䫁鋦화뀯슏夺鹥詧㵳柨䣡ډ㷡呿凉隖項č펍젂鵪㫳辇旂퇗ꎸ羠擝ᥡങ阡廃ﲕꍽ嶢뎑㾽룢隌揄믏灭ໝ卅阐졂ꔨ崚빀浲衁ᒔ엲繺뛅櫫몲鄞쀅㹞묆ṅዢ馅橐럩嶑벚䋜咳䔎릛聊㹔㘋할셃캭笯㿛鯜頿矋멑䨸郞岫桡훌飼鐕疣힃㾻뗾ꁳウ(䎰으뢳녤鼟㹜琷ꩂ䖌萌䏓咉餕㚫 + "ṕ뫣ᰌ懆疞妡ｉ㘑ᦙꔭ띯뷧蔽匡趚쨷쑙: getOwnPropertyNames");\r\n                return Object.getOwnPropertyNames(Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较)\r\n            },삧麆솳纲ᑁ룒菉ē쓎仃鯁誘䢫ꍟ鹦櫗焱秀䋥嗀賾跂淭徔絿ຈ䀏朔璅䅣裫ﳝ欉嗏涉耖䟲㯌썽霉왤ﮒ漎ꋕ儴磍쩋ഘ㨢딘幗ς䞷䜢Ի㧸䥡飝塧쬍壣㟲cꋜអ䆲䬋ꂰᦚշ昘އဝဨ䟄ಱ刍㣴䊷ǔ餡淽힒䕧ᘫ胠헰늩쭦땒挒娄ⶇￄ:undefined,䇙袿䠾ᄞᕃ槨퓪㿝浬犢ᘡ퐳훬㨬嵾ⴤﱗ鹯坟쯍䋳均畬개旇Ԍ殜ס氈讉膪㚲た䏣奔ၸỂ亓犯뷤ໃ幼釷ᇨ蕻㕫樅湫禚ꎐℴ츤羿ꆛ窭枼䳥뺛蟪눗㽌줮㲂㫾귊芀鉜궸㱱ඌ䯇禠ﰯ픍甍笱戀聮櫿岶梚烾㡎蛘걤彼튜뱌퇶밺埢쯢朞삘繽䱤矘鬱긌윯쨾䋲ꙫ쿾儓蝩㲹Т灄愨㿢㱿왻兴ﻼ칖ᐒ콺뿖㜇㒻뺏臘鴝匹:function(name)\r\n            {\r\n                                var 䎰으뢳녤鼟㹜琷ꩂ䖌萌䏓咉餕㚫 = "쥓ꐦ똨䴯텩Ꚕὒ짣䑯쉹ᆐ彎と勽믊п粸둥㫬偂첥鳊ᦓᒌכּ凯娓ꋍέ풢먨鞇腙畩螅낄ዏ撽叨曈씓ǂ犛썽";\r\n                殧펕劬㩶䫁鋦화뀯슏夺鹥詧㵳柨䣡ډ㷡呿凉隖項č펍젂鵪㫳辇旂퇗ꎸ羠擝ᥡങ阡廃ﲕꍽ嶢뎑㾽룢隌揄믏灭ໝ卅阐졂ꔨ崚빀浲衁ᒔ엲繺뛅櫫몲鄞쀅㹞묆ṅዢ馅橐럩嶑벚䋜咳䔎릛聊㹔㘋할셃캭笯㿛鯜頿矋멑䨸郞岫桡훌飼鐕疣힃㾻뗾ꁳウ(䎰으뢳녤鼟㹜琷ꩂ䖌萌䏓咉餕㚫 + "ṕ뫣ᰌ懆疞妡ｉ㘑ᦙꔭ띯뷧蔽匡趚쨷쑙: 䇙袿䠾ᄞᕃ槨퓪㿝浬犢ᘡ퐳훬㨬嵾ⴤﱗ鹯坟쯍䋳均畬개旇Ԍ殜ס氈讉膪㚲た䏣奔ၸỂ亓犯뷤ໃ幼釷ᇨ蕻㕫樅湫禚ꎐℴ츤羿ꆛ窭枼䳥뺛蟪눗㽌줮㲂㫾귊芀鉜궸㱱ඌ䯇禠ﰯ픍甍笱戀聮櫿岶梚烾㡎蛘걤彼튜뱌퇶밺埢쯢朞삘繽䱤矘鬱긌윯쨾䋲ꙫ쿾儓蝩㲹Т灄愨㿢㱿왻兴ﻼ칖ᐒ콺뿖㜇㒻뺏臘鴝匹");\r\n                return arguments[0] in Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较\r\n            },湐鯦栦Ƿ欧:function(name)\r\n            {\r\n                                var 䎰으뢳녤鼟㹜琷ꩂ䖌萌䏓咉餕㚫 = "쥓ꐦ똨䴯텩Ꚕὒ짣䑯쉹ᆐ彎と勽믊п粸둥㫬偂첥鳊ᦓᒌכּ凯娓ꋍέ풢먨鞇腙畩螅낄ዏ撽叨曈씓ǂ犛썽";\r\n                殧펕劬㩶䫁鋦화뀯슏夺鹥詧㵳柨䣡ډ㷡呿凉隖項č펍젂鵪㫳辇旂퇗ꎸ羠擝ᥡങ阡廃ﲕꍽ嶢뎑㾽룢隌揄믏灭ໝ卅阐졂ꔨ崚빀浲衁ᒔ엲繺뛅櫫몲鄞쀅㹞묆ṅዢ馅橐럩嶑벚䋜咳䔎릛聊㹔㘋할셃캭笯㿛鯜頿矋멑䨸郞岫桡훌飼鐕疣힃㾻뗾ꁳウ(䎰으뢳녤鼟㹜琷ꩂ䖌萌䏓咉餕㚫 + "ṕ뫣ᰌ懆疞妡ｉ㘑ᦙꔭ띯뷧蔽匡趚쨷쑙: 湐鯦栦Ƿ欧");\r\n                return Object.prototype.hasOwnProperty.call(Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较,arguments[0])\r\n            },"get":function(큹輩拼맑彰䞬胶㺛녜䦽適젲㷫㧪獷飶죚䎒朅靹篳餑麦톒ꂘ幔佼뉻ᨀ넖ᖨ恦도꺪䟊占䡢ᴂᕎ㑦膒椀仏ꈽޟ䮗ﯷ꺚洉潋匇懲鬻䀎ܓ裓巏蘭梒葈Ꭴ伖廰菃띝鴬砪掬誹칩딞糩䃀텴㹷㽞够橴臇픿쪞ﭤ뽤俎퍁蒋쿝癅Ꮔ穁ႁ䧐㢩펴橿棛霞䗐명꺃휦궋絯泄纛쳌ᗩꚁ溚䠼繼䕚煅譯怟嚉伞ኞ䣈ⷍꝢ籓双䦕,name)\r\n            {\r\n                                var 䎰으뢳녤鼟㹜琷ꩂ䖌萌䏓咉餕㚫 = "쥓ꐦ똨䴯텩Ꚕὒ짣䑯쉹ᆐ彎と勽믊п粸둥㫬偂첥鳊ᦓᒌכּ凯娓ꋍέ풢먨鞇腙畩螅낄ዏ撽叨曈씓ǂ犛썽";\r\n                殧펕劬㩶䫁鋦화뀯슏夺鹥詧㵳柨䣡ډ㷡呿凉隖項č펍젂鵪㫳辇旂퇗ꎸ羠擝ᥡങ阡廃ﲕꍽ嶢뎑㾽룢隌揄믏灭ໝ卅阐졂ꔨ崚빀浲衁ᒔ엲繺뛅櫫몲鄞쀅㹞묆ṅዢ馅橐럩嶑벚䋜咳䔎릛聊㹔㘋할셃캭笯㿛鯜頿矋멑䨸郞岫桡훌飼鐕疣힃㾻뗾ꁳウ(䎰으뢳녤鼟㹜琷ꩂ䖌萌䏓咉餕㚫 + "ṕ뫣ᰌ懆疞妡ｉ㘑ᦙꔭ띯뷧蔽匡趚쨷쑙: get");\r\n                return Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较[arguments[1]]\r\n            },"set":function(큹輩拼맑彰䞬胶㺛녜䦽適젲㷫㧪獷飶죚䎒朅靹篳餑麦톒ꂘ幔佼뉻ᨀ넖ᖨ恦도꺪䟊占䡢ᴂᕎ㑦膒椀仏ꈽޟ䮗ﯷ꺚洉潋匇懲鬻䀎ܓ裓巏蘭梒葈Ꭴ伖廰菃띝鴬砪掬誹칩딞糩䃀텴㹷㽞够橴臇픿쪞ﭤ뽤俎퍁蒋쿝癅Ꮔ穁ႁ䧐㢩펴橿棛霞䗐명꺃휦궋絯泄纛쳌ᗩꚁ溚䠼繼䕚煅譯怟嚉伞ኞ䣈ⷍꝢ籓双䦕,name,ﳑꎽ䄁먍䩱ღ勲휶銔袉甪毤䵬킎钟㗒黿ㅮ僻馕劵遗ﺧ墭춇䩮탵ᖭΖ庁î耉쀿뢢侮㭽夿쒆ﰩꖩᰞ칿䫐萻柩ᤃ뿪륝鷧䛞鏭黴č鹜䈚䣇㞿ฃ쳸쿏鎱瘦疓㜾ᕾ䁕쯐ɾ䏫㲏빪ﾝ楃椌ﲪ䨹삙먏鰥藍鴠肚箿쑩鞦伦ﺰ筫)\r\n            {\r\n                                var 䎰으뢳녤鼟㹜琷ꩂ䖌萌䏓咉餕㚫 = "쥓ꐦ똨䴯텩Ꚕὒ짣䑯쉹ᆐ彎と勽믊п粸둥㫬偂첥鳊ᦓᒌכּ凯娓ꋍέ풢먨鞇腙畩螅낄ዏ撽叨曈씓ǂ犛썽";\r\n                殧펕劬㩶䫁鋦화뀯슏夺鹥詧㵳柨䣡ډ㷡呿凉隖項č펍젂鵪㫳辇旂퇗ꎸ羠擝ᥡങ阡廃ﲕꍽ嶢뎑㾽룢隌揄믏灭ໝ卅阐졂ꔨ崚빀浲衁ᒔ엲繺뛅櫫몲鄞쀅㹞묆ṅዢ馅橐럩嶑벚䋜咳䔎릛聊㹔㘋할셃캭笯㿛鯜頿矋멑䨸郞岫桡훌飼鐕疣힃㾻뗾ꁳウ(䎰으뢳녤鼟㹜琷ꩂ䖌萌䏓咉餕㚫 + "ṕ뫣ᰌ懆疞妡ｉ㘑ᦙꔭ띯뷧蔽匡趚쨷쑙: set");\r\n                Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较[arguments[1]] = arguments[2];\r\n                return true\r\n            },ວ膌礇潥笎酯嬈㬕芾訉呈䨷㸛硝뾻䱪們㸔걄䋾媜監턲儴㼁媭왂밷봮鰄襔챧ꇉ䪠멟㝔ꎩ륋博껃뗹鳳긓縺痐놌븁骠踅跿묮ᠩ䌩됍뒿Œ㚷ꄴꀽ뀫眼䓔ᐄݒ즲曾量謆ꏈ椥㔢ㅸܩⱙ芅盠ꄢ盯麛굱톄罁췀䠏馥过蚛皇쑍먤髳Ẫ렢䮙찰إԿ騋씏珣췳盄乨鴔梷樍괉容쀲Х脵ꆱ肍뗒졠艸暫匁쭟稂憳標䄸됻挈:undefined,䅟뽑찟퉧癶ଘ뒋譧젊蓯掍퇔븑ⱕ㙨ᖵ裌Ⳏ涻싉䋰:undefined,keys:function()\r\n            {\r\n                                var 䎰으뢳녤鼟㹜琷ꩂ䖌萌䏓咉餕㚫 = "쥓ꐦ똨䴯텩Ꚕὒ짣䑯쉹ᆐ彎と勽믊п粸둥㫬偂첥鳊ᦓᒌכּ凯娓ꋍέ풢먨鞇腙畩螅낄ዏ撽叨曈씓ǂ犛썽";\r\n                殧펕劬㩶䫁鋦화뀯슏夺鹥詧㵳柨䣡ډ㷡呿凉隖項č펍젂鵪㫳辇旂퇗ꎸ羠擝ᥡങ阡廃ﲕꍽ嶢뎑㾽룢隌揄믏灭ໝ卅阐졂ꔨ崚빀浲衁ᒔ엲繺뛅櫫몲鄞쀅㹞묆ṅዢ馅橐럩嶑벚䋜咳䔎릛聊㹔㘋할셃캭笯㿛鯜頿矋멑䨸郞岫桡훌飼鐕疣힃㾻뗾ꁳウ(䎰으뢳녤鼟㹜琷ꩂ䖌萌䏓咉餕㚫 + "ṕ뫣ᰌ懆疞妡ｉ㘑ᦙꔭ띯뷧蔽匡趚쨷쑙: keys");\r\n                return Object.keys(Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较)\r\n            }}\r\n        };\r\n        Object.defineProperty(this,"㰔㲈ኒ䯱鐕낢Ẵꐕ沆왨峣瞛呢囡礰느뱮셒鑐䄮䔪솇硄쮈笥礫隳ߦ齫긢䐚럞j蛈䏆ゔ싣䛵嘣",{enumerable:true});\r\n        return 2 + this\r\n    } && 0)\r\n    {\r\n                for(ꄝ幓恒霆敷辌눠잚䙯ᙴ䠵㛛갇Ὠ蟦焂 = 0; Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较 && ꄝ幓恒霆敷辌눠잚䙯ᙴ䠵㛛갇Ὠ蟦焂 < 9; ++ꄝ幓恒霆敷辌눠잚䙯ᙴ䠵㛛갇Ὠ蟦焂)\r\n        {\r\n                        鄘蟢緧翫렝澷妿藉归댈赠셙()\r\n        }\r\n    }\r\n})();\r\n(function()\r\n{\r\n            "use ￅ潳䔟꺡팛ӡｗῘY瑑茥獷詺ጤ쎫ጰ倶わ彦溫ţ홵曇ㅎ펉쵳祦ꆍ珶奅砏ꥁს뢆쇯ቷ梏굮瞙㡩奊鉸睯꾎쒖ဌ毴㿶챱츉䱎菌懐ﾀ鑦鬕鸃槮㽔砉鵶尴飔㧰廛㫻礖짗揪㶢刖㧫竕䑯疡촫身ھ쯕砘垆쓤";\r\n    try\r\n    {\r\n                try\r\n        {\r\n                        Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较 = Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较\r\n        }\r\n        catch(絟葕扒楅ﯲ餇ꡊ衛憎뽌䂠䌖ｲ㡈㷴납嵕ᑍ톁瑊飮珊㳹籣颁휝㫬ぜ鋣䣥횥槂匆믆嗋)\r\n        {\r\n            eval("")\r\n        }\r\n    }\r\n    catch(絟葕扒楅ﯲ餇ꡊ衛憎뽌䂠䌖ｲ㡈㷴납嵕ᑍ톁瑊飮珊㳹籣颁휝㫬ぜ鋣䣥횥槂匆믆嗋)\r\n    {\r\n        eval("")\r\n    }\r\n})();\r\n(function()\r\n{\r\n            for(var 댞莭齐撫뎬쿝젧騊罰艷鷫ᒹ㙜貏撿ਡ葈丛澕坆窔雩萐䖬詍禗配뇊 = 0; new ﲚ賗㽐ꉙ쟽㠻켅졹諝漷럟呀騣ǟぁ릒刣첾씠㪜㛥톿䂖跣㟴瑛誡䧂삊R忒챚浬着괼倌措鈹ꀙﳈ乍憇螘쇽꼅(new 桠㶕铽时묜ᵿ㸔릦箉踟豰歩瀸샱巧耒ᔷￎ徻ﰩ㧾叆㾟蘱晳譯鲪稃桋அ똛仫乨䶆怼ꝟ흽䳗䌷뢨땎飀媑쏗ﴈᆝ㷆㕁버뻲煼즹뎜럢("")) && 댞莭齐撫뎬쿝젧騊罰艷鷫ᒹ㙜貏撿ਡ葈丛澕坆窔雩萐䖬詍禗配뇊 < 16; ++댞莭齐撫뎬쿝젧騊罰艷鷫ᒹ㙜貏撿ਡ葈丛澕坆窔雩萐䖬詍禗配뇊, eval("뾺䐍鼈쥳甈夼叠釫问䪛葄繇ⶵ䋪鶥챣㫮歙뫖鮢䩉薖騡韀셯䕢胉轍Ɋ뢝ç调濌禢눺畟燫䝆㱸䋧欁穫䁀쌠呠㹚缪뼚췾밟䲉(Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较);"))\r\n    {\r\n                if(댞莭齐撫뎬쿝젧騊罰艷鷫ᒹ㙜貏撿ਡ葈丛澕坆窔雩萐䖬詍禗配뇊 % 6 == 5)\r\n        {\r\n                        鄘蟢緧翫렝澷妿藉归댈赠셙 = "u1D98";\r\n            뾺䐍鼈쥳甈夼叠釫问䪛葄繇ⶵ䋪鶥챣㫮歙뫖鮢䩉薖騡韀셯䕢胉轍Ɋ뢝ç调濌禢눺畟燫䝆㱸䋧欁穫䁀쌠呠㹚缪뼚췾밟䲉("")\r\n        }\r\n        else\r\n        {\r\n                          }\r\n    }\r\n    eval("")\r\n})();\r\n(function()\r\n{\r\n            "use ￅ潳䔟꺡팛ӡｗῘY瑑茥獷詺ጤ쎫ጰ倶わ彦溫ţ홵曇ㅎ펉쵳祦ꆍ珶奅砏ꥁს뢆쇯ቷ梏굮瞙㡩奊鉸睯꾎쒖ဌ毴㿶챱츉䱎菌懐ﾀ鑦鬕鸃槮㽔砉鵶尴飔㧰廛㫻礖짗揪㶢刖㧫竕䑯疡촫身ھ쯕砘垆쓤";\r\n    嬵ꏴ렔ìꂮ痺愸屑帼僷㻾逨鮀䛲瞃ÿ㖌䗈知ꏾ贊枫ስﲊ춀떮ኅ뇮謴鄈躗띥谞礯Ꚃው鄶潋術攂㕦赴ﱞ潐씤牋複ﲰ焟䄖䰆ૠ呬煽䠽綢뮾牧炎犵㡍㒳낳ꈚ똹匀흚䙝䵡㾢Ȭ鑗ꖨ䙅㠙婻㳊鐙큚黁ꥃ仫ᬌ诐 * /Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较/;\r\n    呯䠩ጹ얽飯靎冉짖宀ᐘ룱㤘ㄾ黲ﭠ붏麐轑ꔎꔏ떲氳ױ絊욋䐍듖千ﾚ䮨旧㔧딑ᆒ삥菨碱礣䳉ﭸ喪蕑ꡀ蜮걻ম嫑슢喎雍쥗葁遦ㆤ멙죙郵衧캫戒줊銂뤨臑鶔趩췱坚嵪蘋䇹䄡竄츿몐䮞뻉菰偏頁쵂㶯ꁿ쫅뢂譕宼졎쾒鱦ᓼ哑쉴峯䋍椯俔긑ஒ抶k暕涢絫ꃶ㑆㔷ㆂ俺貕蝹驝ሇ / Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较 >= ""\r\n})();\r\n(function()\r\n{\r\n            "use ￅ潳䔟꺡팛ӡｗῘY瑑茥獷詺ጤ쎫ጰ倶わ彦溫ţ홵曇ㅎ펉쵳祦ꆍ珶奅砏ꥁს뢆쇯ቷ梏굮瞙㡩奊鉸睯꾎쒖ဌ毴㿶챱츉䱎菌懐ﾀ鑦鬕鸃槮㽔砉鵶尴飔㧰廛㫻礖짗揪㶢刖㧫竕䑯疡촫身ھ쯕砘垆쓤";\r\n    if(ڠ䡐쮧絠刘뛧澖岗셋뤟돻䣫呜䊮ꂄ坿饈嗑붩瑙귩鷫鵃㺜낱尓쓟㗗流齚ﴋ煀翺暈妩魁暵魅煘곃迻撠考쒽鉇驦ⶼ悪듔ꨍヹᖧ쌄埨轼䠗迅ꍸ楖헖圠ከ㜵腯덅鮀釙縪酺ꎐ怰熝鱡㥓윳伀몢)\r\n    {\r\n                뾺䐍鼈쥳甈夼叠釫问䪛葄繇ⶵ䋪鶥챣㫮歙뫖鮢䩉薖騡韀셯䕢胉轍Ɋ뢝ç调濌禢눺畟燫䝆㱸䋧欁穫䁀쌠呠㹚缪뼚췾밟䲉(Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较)\r\n    }\r\n    eval("")\r\n})();\r\n(function()\r\n{\r\n            㳘旈祮褩ᝁ懙䄢䠬ἱ䚟铭栎렖㧹魋朮伽맓锂䶵렇:[ﲚ賗㽐ꉙ쟽㠻켅졹諝漷럟呀騣ǟぁ릒刣첾씠㪜㛥톿䂖跣㟴瑛誡䧂삊R忒챚浬着괼倌措鈹ꀙﳈ乍憇螘쇽꼅]\r\n})();\r\n(function()\r\n{\r\n            try\r\n    {\r\n                try\r\n        {\r\n                        throw 嬵ꏴ렔ìꂮ痺愸屑帼僷㻾逨鮀䛲瞃ÿ㖌䗈知ꏾ贊枫ስﲊ춀떮ኅ뇮謴鄈躗띥谞礯Ꚃው鄶潋術攂㕦赴ﱞ潐씤牋複ﲰ焟䄖䰆ૠ呬煽䠽綢뮾牧炎犵㡍㒳낳ꈚ똹匀흚䙝䵡㾢Ȭ鑗ꖨ䙅㠙婻㳊鐙큚黁ꥃ仫ᬌ诐;\r\n        }\r\n        catch(絟葕扒楅ﯲ餇ꡊ衛憎뽌䂠䌖ｲ㡈㷴납嵕ᑍ톁瑊飮珊㳹籣颁휝㫬ぜ鋣䣥횥槂匆믆嗋)\r\n        {\r\n            eval("")\r\n        }\r\n    }\r\n    catch(絟葕扒楅ﯲ餇ꡊ衛憎뽌䂠䌖ｲ㡈㷴납嵕ᑍ톁瑊飮珊㳹籣颁휝㫬ぜ鋣䣥횥槂匆믆嗋)\r\n    {\r\n        eval("")\r\n    }\r\n})();\r\n(function()\r\n{\r\n            if(Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较)\r\n    {\r\n                JSON.stringify;\r\n        뾺䐍鼈쥳甈夼叠釫问䪛葄繇ⶵ䋪鶥챣㫮歙뫖鮢䩉薖騡韀셯䕢胉轍Ɋ뢝ç调濌禢눺畟燫䝆㱸䋧欁穫䁀쌠呠㹚缪뼚췾밟䲉(Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较);\r\n        뾺䐍鼈쥳甈夼叠釫问䪛葄繇ⶵ䋪鶥챣㫮歙뫖鮢䩉薖騡韀셯䕢胉轍Ɋ뢝ç调濌禢눺畟燫䝆㱸䋧欁穫䁀쌠呠㹚缪뼚췾밟䲉(Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较)\r\n    }\r\n})();\r\n(function()\r\n{\r\n            뾺䐍鼈쥳甈夼叠釫问䪛葄繇ⶵ䋪鶥챣㫮歙뫖鮢䩉薖騡韀셯䕢胉轍Ɋ뢝ç调濌禢눺畟燫䝆㱸䋧欁穫䁀쌠呠㹚缪뼚췾밟䲉(Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较)\r\n})();\r\n(function()\r\n{\r\n            for(var 絟葕扒楅ﯲ餇ꡊ衛憎뽌䂠䌖ｲ㡈㷴납嵕ᑍ톁瑊飮珊㳹籣颁휝㫬ぜ鋣䣥횥槂匆믆嗋 in[{Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较:3},new Boolean(false),new Boolean(false),new Number(1),-Infinity,-Infinity,-Infinity,-Infinity,new Number(1),"use ￅ潳䔟꺡팛ӡｗῘY瑑茥獷詺ጤ쎫ጰ倶わ彦溫ţ홵曇ㅎ펉쵳祦ꆍ珶奅砏ꥁს뢆쇯ቷ梏굮瞙㡩奊鉸睯꾎쒖ဌ毴㿶챱츉䱎菌懐ﾀ鑦鬕鸃槮㽔砉鵶尴飔㧰廛㫻礖짗揪㶢刖㧫竕䑯疡촫身ھ쯕砘垆쓤",-Infinity,new Boolean(false),new Boolean(false),{Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较:3},new Number(1),"use ￅ潳䔟꺡팛ӡｗῘY瑑茥獷詺ጤ쎫ጰ倶わ彦溫ţ홵曇ㅎ펉쵳祦ꆍ珶奅砏ꥁს뢆쇯ቷ梏굮瞙㡩奊鉸睯꾎쒖ဌ毴㿶챱츉䱎菌懐ﾀ鑦鬕鸃槮㽔砉鵶尴飔㧰廛㫻礖짗揪㶢刖㧫竕䑯疡촫身ھ쯕砘垆쓤","use ￅ潳䔟꺡팛ӡｗῘY瑑茥獷詺ጤ쎫ጰ倶わ彦溫ţ홵曇ㅎ펉쵳祦ꆍ珶奅砏ꥁს뢆쇯ቷ梏굮瞙㡩奊鉸睯꾎쒖ဌ毴㿶챱츉䱎菌懐ﾀ鑦鬕鸃槮㽔砉鵶尴飔㧰廛㫻礖짗揪㶢刖㧫竕䑯疡촫身ھ쯕砘垆쓤",{Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较:3},new Boolean(false),new Number(1),"use ￅ潳䔟꺡팛ӡｗῘY瑑茥獷詺ጤ쎫ጰ倶わ彦溫ţ홵曇ㅎ펉쵳祦ꆍ珶奅砏ꥁს뢆쇯ቷ梏굮瞙㡩奊鉸睯꾎쒖ဌ毴㿶챱츉䱎菌懐ﾀ鑦鬕鸃槮㽔砉鵶尴飔㧰廛㫻礖짗揪㶢刖㧫竕䑯疡촫身ھ쯕砘垆쓤","use ￅ潳䔟꺡팛ӡｗῘY瑑茥獷詺ጤ쎫ጰ倶わ彦溫ţ홵曇ㅎ펉쵳祦ꆍ珶奅砏ꥁს뢆쇯ቷ梏굮瞙㡩奊鉸睯꾎쒖ဌ毴㿶챱츉䱎菌懐ﾀ鑦鬕鸃槮㽔砉鵶尴飔㧰廛㫻礖짗揪㶢刖㧫竕䑯疡촫身ھ쯕砘垆쓤",{Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较:3},new Boolean(false),{Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较:3},new Boolean(false),"use ￅ潳䔟꺡팛ӡｗῘY瑑茥獷詺ጤ쎫ጰ倶わ彦溫ţ홵曇ㅎ펉쵳祦ꆍ珶奅砏ꥁს뢆쇯ቷ梏굮瞙㡩奊鉸睯꾎쒖ဌ毴㿶챱츉䱎菌懐ﾀ鑦鬕鸃槮㽔砉鵶尴飔㧰廛㫻礖짗揪㶢刖㧫竕䑯疡촫身ھ쯕砘垆쓤",new Boolean(false),-Infinity,{Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较:3}])\r\n    {\r\n                뾺䐍鼈쥳甈夼叠釫问䪛葄繇ⶵ䋪鶥챣㫮歙뫖鮢䩉薖騡韀셯䕢胉轍Ɋ뢝ç调濌禢눺畟燫䝆㱸䋧欁穫䁀쌠呠㹚缪뼚췾밟䲉([1])\r\n    }\r\n})();\r\n(function()\r\n{\r\n            function 컒橯鰉퐲캺ﳮ蛽蛸濋覴퉭䩢뵦ǯग़预헴恤ܔ螑햩艎圸즌契ᡍ茨牭옲欠ㄙ鷈쨭鶣죞猘餗釖럤鵄ﱾ쬷爣(u3056)\r\n    {\r\n        eval("")\r\n    }\r\n    컒橯鰉퐲캺ﳮ蛽蛸濋覴퉭䩢뵦ǯग़预헴恤ܔ螑햩艎圸즌契ᡍ茨牭옲欠ㄙ鷈쨭鶣죞猘餗釖럤鵄ﱾ쬷爣("",[[]])\r\n})();\r\n(function()\r\n{\r\n            for(var 捛녚䲠蘿窟峌愰ᢒ쀨织雬퉒륦뮷㠬阶ᴆ䴋뺳抑顙淤맳ꁝ蛦穡퇍촡푌㲘놚ꁂ砍朂눬㤝濈㧶䙕摎跭陿酩쑳废Ὴ䨁琥蠵效곹焟Ա죦ﮔ澐ṱ舴㓆뎛쵽ゕ켚䳯톩 = 0; 捛녚䲠蘿窟峌愰ᢒ쀨织雬퉒륦뮷㠬阶ᴆ䴋뺳抑顙淤맳ꁝ蛦穡퇍촡푌㲘놚ꁂ砍朂눬㤝濈㧶䙕摎跭陿酩쑳废Ὴ䨁琥蠵效곹焟Ա죦ﮔ澐ṱ舴㓆뎛쵽ゕ켚䳯톩 < 10; ++捛녚䲠蘿窟峌愰ᢒ쀨织雬퉒륦뮷㠬阶ᴆ䴋뺳抑顙淤맳ꁝ蛦穡퇍촡푌㲘놚ꁂ砍朂눬㤝濈㧶䙕摎跭陿酩쑳废Ὴ䨁琥蠵效곹焟Ա죦ﮔ澐ṱ舴㓆뎛쵽ゕ켚䳯톩)\r\n    {\r\n                var 浿韟㚡弗䥌勻붰噀Ϩ䳤谤锸㹢ፂ潼뺅㫵竦뚌ㄻ㽹캏槏힐뉈醟冒뇠젰ꍦ饇 = 捛녚䲠蘿窟峌愰ᢒ쀨织雬퉒륦뮷㠬阶ᴆ䴋뺳抑顙淤맳ꁝ蛦穡퇍촡푌㲘놚ꁂ砍朂눬㤝濈㧶䙕摎跭陿酩쑳废Ὴ䨁琥蠵效곹焟Ա죦ﮔ澐ṱ舴㓆뎛쵽ゕ켚䳯톩;\r\n        뾺䐍鼈쥳甈夼叠釫问䪛葄繇ⶵ䋪鶥챣㫮歙뫖鮢䩉薖騡韀셯䕢胉轍Ɋ뢝ç调濌禢눺畟燫䝆㱸䋧欁穫䁀쌠呠㹚缪뼚췾밟䲉(Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较)\r\n    }\r\n})();\r\n(function()\r\n{\r\n            뾺䐍鼈쥳甈夼叠釫问䪛葄繇ⶵ䋪鶥챣㫮歙뫖鮢䩉薖騡韀셯䕢胉轍Ɋ뢝ç调濌禢눺畟燫䝆㱸䋧欁穫䁀쌠呠㹚缪뼚췾밟䲉(Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较)\r\n})();\r\n(function()\r\n{\r\n            "use ￅ潳䔟꺡팛ӡｗῘY瑑茥獷詺ጤ쎫ጰ倶わ彦溫ţ홵曇ㅎ펉쵳祦ꆍ珶奅砏ꥁს뢆쇯ቷ梏굮瞙㡩奊鉸睯꾎쒖ဌ毴㿶챱츉䱎菌懐ﾀ鑦鬕鸃槮㽔砉鵶尴飔㧰廛㫻礖짗揪㶢刖㧫竕䑯疡촫身ھ쯕砘垆쓤";\r\n    㳘旈祮褩ᝁ懙䄢䠬ἱ䚟铭栎렖㧹魋朮伽맓锂䶵렇:"ṣꢂ覴磁誥俢諆ꚋ칻䲪믷噫㴒傅谙懻솯䋝Ꝍ애毎䓾ᗣ貟鉲斀폡ၰ욷냞䏩ꗼ笥綞寷扬列䲡噿艳簒弚㗤脖아瓣ᐙ棻ݸ쐉促ସ藲ଙኁ撗硔ᚩ彸멶뭷읠맫䁚絡阵屫녕郒纤㗙륧늞칎雭穩䗠牥현坓㾖ξ䡱홬욠뫸펿倜託ⷓ姣鏜뇹ꨅ羼픙疗앆哺".replace(/嬵ꏴ렔ìꂮ痺愸屑帼僷㻾逨鮀䛲瞃ÿ㖌䗈知ꏾ贊枫ስﲊ춀떮ኅ뇮謴鄈躗띥谞礯Ꚃው鄶潋術攂㕦赴ﱞ潐씤牋複ﲰ焟䄖䰆ૠ呬煽䠽綢뮾牧炎犵㡍㒳낳ꈚ똹匀흚䙝䵡㾢Ȭ鑗ꖨ䙅㠙婻㳊鐙큚黁ꥃ仫ᬌ诐/,Function.prototype.媿鑑㐵셤좷Ḋ烾됿뱘疾琐ဖ圔促藞ⱂ댄쾽䤏懪豊쫺ឫ죭웊惡燒胇閅䏉熌Ԋꃗꗠꂂᰑਈ理欅䚸鄤졡䛈䆿)["_" + undefined]\r\n})();\r\n(function()\r\n{\r\n            "use ￅ潳䔟꺡팛ӡｗῘY瑑茥獷詺ጤ쎫ጰ倶わ彦溫ţ홵曇ㅎ펉쵳祦ꆍ珶奅砏ꥁს뢆쇯ቷ梏굮瞙㡩奊鉸睯꾎쒖ဌ毴㿶챱츉䱎菌懐ﾀ鑦鬕鸃槮㽔砉鵶尴飔㧰廛㫻礖짗揪㶢刖㧫竕䑯疡촫身ھ쯕砘垆쓤";\r\n    閥䡪挢箥同赦늳즜닣ῶ䯵삡鄙뙶㶠昳盧ﺴ䉘牙鋁礶ꍤ뻰馋毪櫟䃓俉槖ṍ踩ᴩ婟凜玲䵽疾鱱䦶罸㥍繝獉瘟쬩健檓虫拀咶떎䮗ᒻ铞㤾筯җ휅贫額कⶥ俔榼崬㱎蒠殅먵췧袥멩鱍긕㣂偞듘䘺ᕂ藀㷽昂䠔㚖賈塡吂缉嘣鐅擣ﳙ螃ﰀ嬀髼娾燔㠲䚢փ팓ꤺ䂑턦셦䏫娓則杌츾讀윰뼞滨盧უ뙺樂谡ㆷҒᢝ鮚햀Ҿ깉곩(0);\r\n    뾺䐍鼈쥳甈夼叠釫问䪛葄繇ⶵ䋪鶥챣㫮歙뫖鮢䩉薖騡韀셯䕢胉轍Ɋ뢝ç调濌禢눺畟燫䝆㱸䋧欁穫䁀쌠呠㹚缪뼚췾밟䲉(Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较);\r\n    뾺䐍鼈쥳甈夼叠釫问䪛葄繇ⶵ䋪鶥챣㫮歙뫖鮢䩉薖騡韀셯䕢胉轍Ɋ뢝ç调濌禢눺畟燫䝆㱸䋧欁穫䁀쌠呠㹚缪뼚췾밟䲉(Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较);\r\n    뾺䐍鼈쥳甈夼叠釫问䪛葄繇ⶵ䋪鶥챣㫮歙뫖鮢䩉薖騡韀셯䕢胉轍Ɋ뢝ç调濌禢눺畟燫䝆㱸䋧欁穫䁀쌠呠㹚缪뼚췾밟䲉(Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较)\r\n})();\r\n(function()\r\n{\r\n            for(var 浿韟㚡弗䥌勻붰噀Ϩ䳤谤锸㹢ፂ潼뺅㫵竦뚌ㄻ㽹캏槏힐뉈醟冒뇠젰ꍦ饇 in[[1],arguments,arguments,[1],[1],this,this,this,this,arguments,[1],[1],this,[1],[1]])\r\n    {\r\n                ""\r\n    }\r\n})();\r\n(function()\r\n{\r\n            뾺䐍鼈쥳甈夼叠釫问䪛葄繇ⶵ䋪鶥챣㫮歙뫖鮢䩉薖騡韀셯䕢胉轍Ɋ뢝ç调濌禢눺畟燫䝆㱸䋧欁穫䁀쌠呠㹚缪뼚췾밟䲉("".valueOf("number"))\r\n})();\r\n(function()\r\n{\r\n            var 틠Ä텩硚墬棣멥椦瓗䉭鐲쌭孅㠉ᢂ簁㰰뫖毢妹좵鐶퀺휑ṅ틻悺뢭땹骬㪺爫ἅ峮멓쳝벎뫁秓嶊贽㱸囟唊댱ᚓﻳꀮ줇瞟ᑈ쏷뻢즒ꊗ抓鵝ꘪ貳酒巨놎賛ధ㚜瞳㚫ꃧ鏂퐏읦緰궉ꈚ鮹僑熲懲㹥隕飶馿챛휼ᓵ峗䴉졗뢫嫩爗鐆鉫獡䲅牂ᰉ릑Ƥ횱㑷ཊ乎謁쓱绠㿋䕭ꁷ㮴넇绌眷穝떘讪丗볊犯鑰检䴺娙픦횿䅥㹄㶾稉䌚吻䳾彵湀 = new 녩핍紞벩遟歺唱ᒫ맞히尰쪔桢灇즷祈싌䂈仗㲞㮎撇㙪梎鉈鬩惚띗矬饟鵯䓇뾱헫ᘸ팯쀫侙鞉碅諔溊閽珱ﾍ烡虶䂀脚恽ꆘ녗싨禁鎮皮动켃䡁ਆ겓箨ᎋ筣ᓭ帬鉷宅떑լ눽慍䙶壟鹙畮璟猅꾒ⱼ믑넷讶侍勹咶ᛩ쌫츅띒琔ᕡ幢愱瘣ነ殭껵㟳ꤤ歡揹仦㰂歼沙펼њ禵抯ȅꝨ纝뮳(8);\r\n    var izwfls_0 = new Uint8Array(틠Ä텩硚墬棣멥椦瓗䉭鐲쌭孅㠉ᢂ簁㰰뫖毢妹좵鐶퀺휑ṅ틻悺뢭땹骬㪺爫ἅ峮멓쳝벎뫁秓嶊贽㱸囟唊댱ᚓﻳꀮ줇瞟ᑈ쏷뻢즒ꊗ抓鵝ꘪ貳酒巨놎賛ధ㚜瞳㚫ꃧ鏂퐏읦緰궉ꈚ鮹僑熲懲㹥隕飶馿챛휼ᓵ峗䴉졗뢫嫩爗鐆鉫獡䲅牂ᰉ릑Ƥ횱㑷ཊ乎謁쓱绠㿋䕭ꁷ㮴넇绌眷穝떘讪丗볊犯鑰检䴺娙픦횿䅥㹄㶾稉䌚吻䳾彵湀);\r\n    뾺䐍鼈쥳甈夼叠釫问䪛葄繇ⶵ䋪鶥챣㫮歙뫖鮢䩉薖騡韀셯䕢胉轍Ɋ뢝ç调濌禢눺畟燫䝆㱸䋧欁穫䁀쌠呠㹚缪뼚췾밟䲉(izwfls_0[0]);\r\n    izwfls_0[0] = -65535;\r\n    "u6E6E"\r\n})();\r\n(function()\r\n{\r\n            뾺䐍鼈쥳甈夼叠釫问䪛葄繇ⶵ䋪鶥챣㫮歙뫖鮢䩉薖騡韀셯䕢胉轍Ɋ뢝ç调濌禢눺畟燫䝆㱸䋧欁穫䁀쌠呠㹚缪뼚췾밟䲉(Ԋ뼶뒽竼쌍繊兒ⵁ搄絒죕㖩㙺藗碀덬声쑒顕庺얾荠ﬆ筥よ起ၶ蒓辊랻䍄뗛髖뀍Ŭ쌲䁑缊箮酕饯ꗧ冋칇嘂딾떚ꗟ췱縙Ǭ題嵛畡龻ﮰ億脎ﵿ䃡嵎ʋ촠닦ѕ罗咕䱗챁뻫뙋㦇ɽ剐鵤긠椟뀣謞)\r\n})();\r\n(function()\r\n{\r\n            for(var 㭽䬌 = 0; 㭽䬌 < 5; ++㭽䬌)\r\n    {\r\n                Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较\r\n    }\r\n})();\r\n(function()\r\n{\r\n            뾺䐍鼈쥳甈夼叠釫问䪛葄繇ⶵ䋪鶥챣㫮歙뫖鮢䩉薖騡韀셯䕢胉轍Ɋ뢝ç调濌禢눺畟燫䝆㱸䋧欁穫䁀쌠呠㹚缪뼚췾밟䲉(new ﲚ賗㽐ꉙ쟽㠻켅졹諝漷럟呀騣ǟぁ릒刣첾씠㪜㛥톿䂖跣㟴瑛誡䧂삊R忒챚浬着괼倌措鈹ꀙﳈ乍憇螘쇽꼅([ﲚ賗㽐ꉙ쟽㠻켅졹諝漷럟呀騣ǟぁ릒刣첾씠㪜㛥톿䂖跣㟴瑛誡䧂삊R忒챚浬着괼倌措鈹ꀙﳈ乍憇螘쇽꼅]));\r\n    function Ԋ뼶뒽竼쌍繊兒ⵁ搄絒죕㖩㙺藗碀덬声쑒顕庺얾荠ﬆ筥よ起ၶ蒓辊랻䍄뗛髖뀍Ŭ쌲䁑缊箮酕饯ꗧ冋칇嘂딾떚ꗟ췱縙Ǭ題嵛畡龻ﮰ億脎ﵿ䃡嵎ʋ촠닦ѕ罗咕䱗챁뻫뙋㦇ɽ剐鵤긠椟뀣謞()\r\n    {\r\n        eval("")\r\n    }\r\n    뾺䐍鼈쥳甈夼叠釫问䪛葄繇ⶵ䋪鶥챣㫮歙뫖鮢䩉薖騡韀셯䕢胉轍Ɋ뢝ç调濌禢눺畟燫䝆㱸䋧欁穫䁀쌠呠㹚缪뼚췾밟䲉(function 鑎쒫䖭者麧ꂘᬅ齬죻뛐垮慫ؽ著绁沢窉䨹ᕎ遾ތ륖桲Ϛ硷휮ꨗ斲妫숗䘭䜻拮忌莀䗼硟鱗䄞챋뱼䨡ﭳ踜辋餋憮븡㛺ꁿ닶扯聿륽尦ਵꍊꂳ벩Ꮏ떂손䃶ᕔ湿㞏믺꾃巌꺣힖쨠醟蠌쉮곖쒮豾췦嚨ꁫĶᛓᐨ芌흻졺뤢筧탼宱궂ᗢ쮳횒鎝舟鹩㔑䝭䛲ጽ깍䛸驻쓈䞔冐烧䟆ㅮḹネ溷렄(짘簃拍翲碎ꉪﯻ慞낤爯卹錷ᒹጆ儚风軽䈍ᄸ뼩ᮐ휼ڄу똅轩賢紙䮀匱鷨닲켆꼦瓬緡霢霜謁ནᰔ宰曪㫛㧵ᕥꎣᢀ펻侢祮ꂓ鸦䗵퇵휯솇柖댱뿷鋧鱌䅇䐣葳磊箂좧婕骻䈾燴휺㪰흴乆㦄獠ꈆ㙦㠤媌)\r\n    {\r\n                        if(arguments[0] == 0)\r\n        {\r\n                        return 1\r\n        }\r\n                return arguments[0] * 鑎쒫䖭者麧ꂘᬅ齬죻뛐垮慫ؽ著绁沢窉䨹ᕎ遾ތ륖桲Ϛ硷휮ꨗ斲妫숗䘭䜻拮忌莀䗼硟鱗䄞챋뱼䨡ﭳ踜辋餋憮븡㛺ꁿ닶扯聿륽尦ਵꍊꂳ벩Ꮏ떂손䃶ᕔ湿㞏믺꾃巌꺣힖쨠醟蠌쉮곖쒮豾췦嚨ꁫĶᛓᐨ芌흻졺뤢筧탼宱궂ᗢ쮳횒鎝舟鹩㔑䝭䛲ጽ깍䛸驻쓈䞔冐烧䟆ㅮḹネ溷렄(arguments[0] - 1)\r\n    }(13))\r\n})();\r\n(function()\r\n{\r\n            "use ￅ潳䔟꺡팛ӡｗῘY瑑茥獷詺ጤ쎫ጰ倶わ彦溫ţ홵曇ㅎ펉쵳祦ꆍ珶奅砏ꥁს뢆쇯ቷ梏굮瞙㡩奊鉸睯꾎쒖ဌ毴㿶챱츉䱎菌懐ﾀ鑦鬕鸃槮㽔砉鵶尴飔㧰廛㫻礖짗揪㶢刖㧫竕䑯疡촫身ھ쯕砘垆쓤";\r\n    try\r\n    {\r\n                "uF633";\r\n        鄘蟢緧翫렝澷妿藉归댈赠셙()\r\n    }\r\n    catch(絟葕扒楅ﯲ餇ꡊ衛憎뽌䂠䌖ｲ㡈㷴납嵕ᑍ톁瑊飮珊㳹籣颁휝㫬ぜ鋣䣥횥槂匆믆嗋)\r\n    {\r\n        eval("")\r\n    }\r\n})();\r\n(function()\r\n{\r\n         뾺䐍鼈쥳甈夼叠釫问䪛葄繇ⶵ䋪鶥챣㫮歙뫖鮢䩉薖騡韀셯䕢胉轍Ɋ뢝ç调濌禢눺畟燫䝆㱸䋧欁穫䁀쌠呠㹚缪뼚췾밟䲉(/Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较/)\r\n})();\r\n(function()\r\n{for(var 鄘蟢緧翫렝澷妿藉归댈赠셙 in[/Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较/])\r\n       呯䠩ጹ얽飯靎冉짖宀ᐘ룱㤘ㄾ黲ﭠ붏麐轑ꔎꔏ떲氳ױ絊욋䐍듖千ﾚ䮨旧㔧딑ᆒ삥菨碱礣䳉ﭸ喪蕑ꡀ蜮걻ম嫑슢喎雍쥗葁遦ㆤ멙죙郵衧캫戒줊銂뤨臑鶔趩췱坚嵪蘋䇹䄡竄츿몐䮞뻉菰偏頁쵂㶯ꁿ쫅뢂譕宼졎쾒鱦ᓼ哑쉴峯䋍椯俔긑ஒ抶k暕涢絫ꃶ㑆㔷ㆂ俺貕蝹驝ሇ, Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较, /Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较/;\r\n    呯䠩ጹ얽飯靎冉짖宀ᐘ룱㤘ㄾ黲ﭠ붏麐轑ꔎꔏ떲氳ױ絊욋䐍듖千ﾚ䮨旧㔧딑ᆒ삥菨碱礣䳉ﭸ喪蕑ꡀ蜮걻ম嫑슢喎雍쥗葁遦ㆤ멙죙郵衧캫戒줊銂뤨臑鶔趩췱坚嵪蘋䇹䄡竄츿몐䮞뻉菰偏頁쵂㶯ꁿ쫅뢂譕宼졎쾒鱦ᓼ哑쉴峯䋍椯俔긑ஒ抶k暕涢絫ꃶ㑆㔷ㆂ俺貕蝹驝ሇ, /Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较/;\r\n    呯䠩ጹ얽飯靎冉짖宀ᐘ룱㤘ㄾ黲ﭠ붏麐轑ꔎꔏ떲氳ױ絊욋䐍듖千ﾚ䮨旧㔧딑ᆒ삥菨碱礣䳉ﭸ喪蕑ꡀ蜮걻ম嫑슢喎雍쥗葁遦ㆤ멙죙郵衧캫戒줊銂뤨臑鶔趩췱坚嵪蘋䇹䄡竄츿몐䮞뻉菰偏頁쵂㶯ꁿ쫅뢂譕宼졎쾒鱦ᓼ哑쉴峯䋍椯俔긑ஒ抶k暕涢絫ꃶ㑆㔷ㆂ俺貕蝹驝ሇ, /Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较/;\r\n    呯䠩ጹ얽飯靎冉짖宀ᐘ룱㤘ㄾ黲ﭠ붏麐轑ꔎꔏ떲氳ױ絊욋䐍듖千ﾚ䮨旧㔧딑ᆒ삥菨碱礣䳉ﭸ喪蕑ꡀ蜮걻ম嫑슢喎雍쥗葁遦ㆤ멙죙郵衧캫戒줊銂뤨臑鶔趩췱坚嵪蘋䇹䄡竄츿몐䮞뻉菰偏頁쵂㶯ꁿ쫅뢂譕宼졎쾒鱦ᓼ哑쉴峯䋍椯俔긑ஒ抶k暕涢絫ꃶ㑆㔷ㆂ俺貕蝹驝ሇ, 3, /Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较/;\r\n    呯䠩ጹ얽飯靎冉짖宀ᐘ룱㤘ㄾ黲ﭠ붏麐轑ꔎꔏ떲氳ױ絊욋䐍듖千ﾚ䮨旧㔧딑ᆒ삥菨碱礣䳉ﭸ喪蕑ꡀ蜮걻ম嫑슢喎雍쥗葁遦ㆤ멙죙郵衧캫戒줊銂뤨臑鶔趩췱坚嵪蘋䇹䄡竄츿몐䮞뻉菰偏頁쵂㶯ꁿ쫅뢂譕宼졎쾒鱦ᓼ哑쉴峯䋍椯俔긑ஒ抶k暕涢絫ꃶ㑆㔷ㆂ俺貕蝹驝ሇ, Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较, Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较, Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较, /Х偙㕟낔㜲Ԓ䢻厲ￕ㬛夁폽毸䄙ﲣ턦탋䐎樶괽咽国ꂎ㔼먬ﶥ疱㮚弤徲坖桛巵䶅騣瀶ᛪ兆췴붂嶵쀖蠢ﲒ妗撄笟ಠ胯ḷ顢䂽镬鵿煴祵뺭ጙ襨Ꭳⲁ튙숅ﲪ떚啷ꌘ줈抑倚ϖ䩷퉦趂淶欒贶较/;}) */');

WScript.Echo("Pass");