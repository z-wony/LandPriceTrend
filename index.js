#!/bin/node

var k = require('./apikey.js');

var urlBase = 'http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvcAptTradeDev?ServiceKey=';

// Service Key Request: https://data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15057511
var serviceKey = k.serviceKey;

var numOfRows = 1000;

// https://www.code.go.kr/index.do
var landCode = '41465';

function cookingUrl(base, key, pn, rows, code, ym) {
  var url = base + key + '&pageNo=' + pn + '&numOfRows=' + rows + '&LAWD_CD=' + code + '&DEAL_YMD=' + ym;
  return url;
}


var request = require('sync-request');

var parseString = require('xml2js').parseString;

var keylist = [ '도로명', '도로명건물본번호코드', '도로명건물부번호코드', '도로명코드',
				'법정동', '법정동본번코드', '법정동부번코드', '지번',
				'아파트', '일련번호', '전용면적', '층', '연', '월', '일', '거래금액' ];

var keystr = 'No';
keylist.forEach(function(key) {
  keystr = keystr + ',' + key;
});

console.log(keystr);

var startYear = 2018;
var startMonth = 1;
var endYear = 2020;
var endMonth = 11;

var index = 1;

for (var y = startYear; y <= endYear; y++) {
  for (var m = 1; m <= 12; m++) {
    if (y == startYear && m == 1)
      m = startMonth;

    ym = '' + y;
    if (m < 10) {
      ym += '0' + m;
    } else {
      ym += m;
    }
    printPrice(ym);

    if (y == endYear && m == endMonth) {
      break;
    }
  }
}

function printPrice(yearMonth) {
  var pageNo = 1;

  var apiurl = cookingUrl(urlBase, serviceKey, (pageNo + ''), (numOfRows + ''), landCode, yearMonth);

  var queryCount = 0;
  var remainCount = 0;
  var totalCount = 0;

  do {
    var res = request('GET', apiurl);
    //console.log('yearMonth: ' + yearMonth + ', status: ' + res.statusCode);
    var xml = res.getBody().toString();
    parseString(xml, function (err, result) {
        if (err)
          return;

        queryCount += parseInt(result.response.body[0].numOfRows);
        totalCount = parseInt(result.response.body[0].totalCount);
        remainCount = totalCount - queryCount;

        result.response.body[0].items[0].item.forEach(item => {
            var printstr = '' + index;
            keylist.forEach(function(key) {
                if (key == '거래금액')
                  printstr = printstr + ',' + item[key].toString().trim().replace(',', '').replace(',', '');
                else if (key == '연')
                  printstr = printstr + ',' + yearMonth.substring(0, 4);
                else
                  printstr = printstr + ',' + item[key];
                });
            console.log(printstr);
            index++;
            });
        });
    pageNo++;
    apiurl = cookingUrl(urlBase, serviceKey, (pageNo + ''), (numOfRows + ''), landCode, yearMonth);
  } while (remainCount > 0);
}

