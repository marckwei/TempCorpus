function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

function noInline() {
}

function OSRExit() {
}

function ensureArrayStorage() {
}

function fiatInt52(i) {
	return i;
}

function noDFG() {
}

function noOSRExitFuzzing() {
}

function isFinalTier() {
	return true;
}

function transferArrayBuffer() {
}

function fullGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function edenGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function forceGCSlowPaths() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function noFTL() {

}

function debug(x) {
	console.log(x);
}

function describe(x) {
	console.log(x);
}

function isInt32(i) {
	return (typeof i === "number");
}

function BigInt(i) {
	return i;
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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error(`expected ${expected} but got ${actual}`);
}

function shouldBeOneOf(actual, expectedArray) {
    if (!expectedArray.some((value) => value === actual))
        throw new Error('bad value: ' + actual + ' expected values: ' + expectedArray);
}

{
    let he = new Intl.Locale("he")
    shouldBe(JSON.stringify(he.getWeekInfo()), `{"firstDay":7,"weekend":[5,6],"minimalDays":1}`);
    let af = new Intl.Locale("af")
    shouldBe(JSON.stringify(af.getWeekInfo()), `{"firstDay":7,"weekend":[6,7],"minimalDays":1}`);
    let enGB = new Intl.Locale("en-GB")
    shouldBe(JSON.stringify(enGB.getWeekInfo()), `{"firstDay":1,"weekend":[6,7],"minimalDays":4}`);
    let msBN = new Intl.Locale("ms-BN");
    // "weekend" should be [5,7]. But currently ICU/CLDR does not support representing non-contiguous weekend.
    shouldBe(JSON.stringify(msBN.getWeekInfo()), `{"firstDay":1,"weekend":[6,7],"minimalDays":1}`);
}
{
    let l = new Intl.Locale("ar")
    shouldBe(JSON.stringify(l.getTextInfo()), `{"direction":"rtl"}`);
}
{
    let locale = new Intl.Locale("ar")
    shouldBe(JSON.stringify(locale.getCalendars()), `["gregory","coptic","islamic","islamic-civil","islamic-tbla"]`);
    shouldBe(JSON.stringify(locale.getCollations()), `["compat","emoji","eor"]`);
    shouldBe(locale.hourCycle, undefined);
    shouldBe(JSON.stringify(locale.getHourCycles()), `["h12"]`);
    let ns = JSON.stringify(locale.getNumberingSystems());
    shouldBe(ns === `["arab"]` || ns === `["latn"]`, true);
    shouldBe(locale.getTimeZones(), undefined);
}
{
    let locale = new Intl.Locale("ar-EG")
    shouldBe(JSON.stringify(locale.getCalendars()), `["gregory","coptic","islamic","islamic-civil","islamic-tbla"]`);
    shouldBe(JSON.stringify(locale.getCollations()), `["compat","emoji","eor"]`);
    shouldBe(locale.hourCycle, undefined);
    shouldBe(JSON.stringify(locale.getHourCycles()), `["h12"]`);
    shouldBe(JSON.stringify(locale.getNumberingSystems()), `["arab"]`);
    shouldBe(JSON.stringify(locale.getTimeZones()), `["Africa/Cairo"]`);
}
{
    let locale = new Intl.Locale("ar-SA")
    let calendars = JSON.stringify(locale.getCalendars());
    shouldBe(calendars === `["islamic-umalqura","islamic-rgsa","islamic","gregory"]` || calendars === `["islamic-umalqura","gregory","islamic","islamic-rgsa"]`, true);
    shouldBe(JSON.stringify(locale.getCollations()), `["compat","emoji","eor"]`);
    shouldBe(locale.hourCycle, undefined);
    shouldBe(JSON.stringify(locale.getHourCycles()), `["h12"]`);
    shouldBe(JSON.stringify(locale.getNumberingSystems()), `["arab"]`);
    shouldBe(JSON.stringify(locale.getTimeZones()), `["Asia/Riyadh"]`);
}
{
    let locale = new Intl.Locale("ja")
    shouldBe(JSON.stringify(locale.getCalendars()), `["gregory","japanese"]`);
    shouldBe(JSON.stringify(locale.getCollations()), `["unihan","emoji","eor"]`);
    shouldBe(locale.hourCycle, undefined);
    shouldBe(JSON.stringify(locale.getHourCycles()), `["h23"]`);
    shouldBe(JSON.stringify(locale.getNumberingSystems()), `["latn"]`);
    shouldBe(locale.getTimeZones(), undefined);
}
{
    let locale = new Intl.Locale("ja-JP")
    shouldBe(JSON.stringify(locale.getCalendars()), `["gregory","japanese"]`);
    shouldBe(JSON.stringify(locale.getCollations()), `["unihan","emoji","eor"]`);
    shouldBe(locale.hourCycle, undefined);
    shouldBe(JSON.stringify(locale.getHourCycles()), `["h23"]`);
    shouldBe(JSON.stringify(locale.getNumberingSystems()), `["latn"]`);
    shouldBe(JSON.stringify(locale.getTimeZones()), `["Asia/Tokyo"]`);
}
{
    let locale = new Intl.Locale("en-US")
    shouldBe(JSON.stringify(locale.getCalendars()), `["gregory"]`);
    shouldBe(JSON.stringify(locale.getCollations()), `["emoji","eor"]`);
    shouldBe(locale.hourCycle, undefined);
    shouldBe(JSON.stringify(locale.getHourCycles()), `["h12"]`);
    shouldBe(JSON.stringify(locale.getNumberingSystems()), `["latn"]`);
    shouldBe(JSON.stringify(locale.getTimeZones()), `["America/Adak","America/Anchorage","America/Boise","America/Chicago","America/Denver","America/Detroit","America/Indiana/Knox","America/Indiana/Marengo","America/Indiana/Petersburg","America/Indiana/Tell_City","America/Indiana/Vevay","America/Indiana/Vincennes","America/Indiana/Winamac","America/Indianapolis","America/Juneau","America/Kentucky/Monticello","America/Los_Angeles","America/Louisville","America/Menominee","America/Metlakatla","America/New_York","America/Nome","America/North_Dakota/Beulah","America/North_Dakota/Center","America/North_Dakota/New_Salem","America/Phoenix","America/Sitka","America/Yakutat","Pacific/Honolulu"]`);
}
{
    let locale = new Intl.Locale("en-NZ")
    shouldBe(JSON.stringify(locale.getCalendars()), `["gregory"]`);
    shouldBe(JSON.stringify(locale.getCollations()), `["emoji","eor"]`);
    shouldBe(locale.hourCycle, undefined);
    shouldBe(JSON.stringify(locale.getHourCycles()), `["h12"]`);
    shouldBe(JSON.stringify(locale.getNumberingSystems()), `["latn"]`);
    shouldBe(JSON.stringify(locale.getTimeZones()), `["Pacific/Auckland","Pacific/Chatham"]`);
}
{
    let locale = new Intl.Locale("zh")
    shouldBe(JSON.stringify(locale.getCalendars()), `["gregory","chinese"]`);
    shouldBe(JSON.stringify(locale.getCollations()), `["pinyin","big5han","gb2312","stroke","unihan","zhuyin","emoji","eor"]`);
    shouldBe(locale.hourCycle, undefined);
    shouldBeOneOf(JSON.stringify(locale.getHourCycles()), [ `["h23"]`, `["h12"]` ]);
    shouldBe(JSON.stringify(locale.getNumberingSystems()), `["latn"]`);
    shouldBe(locale.getTimeZones(), undefined);
}
{
    let locale = new Intl.Locale("zh-TW")
    shouldBe(JSON.stringify(locale.getCalendars()), `["gregory","roc","chinese"]`);
    shouldBe(JSON.stringify(locale.getCollations()), `["stroke","big5han","gb2312","pinyin","unihan","zhuyin","emoji","eor"]`);
    shouldBe(locale.hourCycle, undefined);
    shouldBe(JSON.stringify(locale.getHourCycles()), `["h12"]`);
    shouldBe(JSON.stringify(locale.getNumberingSystems()), `["latn"]`);
    shouldBe(JSON.stringify(locale.getTimeZones()), `["Asia/Taipei"]`);
}
{
    let locale = new Intl.Locale("zh-HK")
    shouldBe(JSON.stringify(locale.getCalendars()), `["gregory","chinese"]`);
    shouldBe(JSON.stringify(locale.getCollations()), `["stroke","big5han","gb2312","pinyin","unihan","zhuyin","emoji","eor"]`);
    shouldBe(locale.hourCycle, undefined);
    shouldBe(JSON.stringify(locale.getHourCycles()), `["h12"]`);
    shouldBe(JSON.stringify(locale.getNumberingSystems()), `["latn"]`);
    shouldBe(JSON.stringify(locale.getTimeZones()), `["Asia/Hong_Kong"]`);
}
{
    let locale = new Intl.Locale("fa")
    shouldBe(JSON.stringify(locale.getCalendars()), `["persian","gregory","islamic","islamic-civil","islamic-tbla"]`);
    shouldBe(JSON.stringify(locale.getCollations()), `["emoji","eor"]`);
    shouldBe(locale.hourCycle, undefined);
    shouldBe(JSON.stringify(locale.getHourCycles()), `["h23"]`);
    shouldBe(JSON.stringify(locale.getNumberingSystems()), `["arabext"]`);
    shouldBe(locale.getTimeZones(), undefined);
}
