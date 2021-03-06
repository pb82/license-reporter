'use strict';

const test = require('tape');
const stdout = require('test-console').stdout;
const unifiedlist = require('../lib/unifiedlist.js');

const xmlObject = {
  dependencies: {
    dependency: [
      {
        packageName: 'testProject',
        version: '1.0.0',
        licenses: {
          license: [
            {name: 'MIT', url: '...'}
          ]
        }
      },
      {
        packageName: 'notApproved',
        version: '2.0.0',
        licenses: {
          license: [
            {name: '9wm License (Original)', url: '...'}
          ]
        }
      }
    ]
  }
};

test('Should get the licenses from xmlObject', (t) => {
  t.plan(3);
  const licenses = unifiedlist._getLicensesFromXmlObject(xmlObject);
  t.equal(licenses.length, 2);
  t.equal(licenses[0].license, 'MIT');
  t.equal(licenses[1].license, '9wm License (Original)');
  t.end();
});

test('Should get approved only from xmlObject based on unified list', (t) => {
  t.plan(1);
  const licenses = unifiedlist._getLicensesFromXmlObject(xmlObject);
  const approvedList = [];
  const unifiedList = require('../lib/resources/default-unifiedlist.json');
  Object.keys(unifiedList).forEach(key => {
    if (unifiedList[key].approved === 'yes') {
      approvedList.push(unifiedList[key]);
    }
  });
  const approved = unifiedlist._findApproved(approvedList, licenses);
  t.equal(Array.from(approved)[0].license, 'MIT');
  t.end();
});

test('Should get not approved only from xmlObject based on unified list', (t) => {
  t.plan(1);
  const licenses = unifiedlist._getLicensesFromXmlObject(xmlObject);
  const notApprovedList = [];
  const unifiedList = require('../lib/resources/default-unifiedlist.json');
  Object.keys(unifiedList).forEach(key => {
    if (unifiedList[key].approved !== 'yes') {
      notApprovedList.push(unifiedList[key]);
    }
  });
  const notApproved = unifiedlist._findNotApproved(notApprovedList, licenses);
  t.equal(Array.from(notApproved)[0].license, '9wm License (Original)');
  t.end();
});

test('Should print approved licenses', (t) => {
  t.plan(1);
  const expected = ['========= APPROVED LICENSES        ==========\n',
    'name: testProject , version: 1.0.0 , licenses: MIT\n',
    '========= APPROVED LICENSES        ==========\n'];

  const licenses = unifiedlist._getLicensesFromXmlObject(xmlObject);
  const approvedList = [];
  const unifiedList = require('../lib/resources/default-unifiedlist.json');
  Object.keys(unifiedList).forEach(key => {
    if (unifiedList[key].approved === 'yes') {
      approvedList.push(unifiedList[key]);
    }
  });
  const approved = unifiedlist._findApproved(approvedList, licenses);
  const log = stdout.inspectSync(() => { unifiedlist._printApproved(approved); });
  t.deepEqual(log, expected);
  t.end();
});

test('Should print not approved licenses', (t) => {
  t.plan(1);
  const expected = ['========= NOT APPROVED LICENSES    ==========\n',
    'name: notApproved , version: 2.0.0 , licenses: 9wm License (Original)\n',
    '========= NOT APPROVED LICENSES    ==========\n'];

  const licenses = unifiedlist._getLicensesFromXmlObject(xmlObject);
  const notApprovedList = [];
  const unifiedList = require('../lib/resources/default-unifiedlist.json');
  Object.keys(unifiedList).forEach(key => {
    if (unifiedList[key].approved !== 'yes') {
      notApprovedList.push(unifiedList[key]);
    }
  });
  const notApproved = unifiedlist._findNotApproved(notApprovedList, licenses);
  const log = stdout.inspectSync(() => { unifiedlist._printNotApproved(notApproved); });
  t.deepEqual(log, expected);
  t.end();
});

test('Should print approved and approved licenses', (t) => {
  t.plan(1);
  const expected = ['========= APPROVED LICENSES        ==========\n',
    'name: testProject , version: 1.0.0 , licenses: MIT\n',
    '========= APPROVED LICENSES        ==========\n',
    '========= NOT APPROVED LICENSES    ==========\n',
    'name: notApproved , version: 2.0.0 , licenses: 9wm License (Original)\n',
    '========= NOT APPROVED LICENSES    ==========\n'];
  const log = stdout.inspectSync(() => {
    unifiedlist.check(xmlObject);
  });
  t.deepEqual(log, expected);
  t.end();
});

test('Should return url for the specified license name', (t) => {
  t.plan(4);
  t.equal(unifiedlist.urlForName('3dfx Glide License'),
      'http://www.users.on.net/~triforce/glidexp/COPYING.txt');
  t.equal(unifiedlist.urlForName('4Suite Copyright License'), '');
  t.equal(unifiedlist.urlForName('UNKNOWN'), 'UNKNOWN');
  t.throws(() => { unifiedlist.urlForName('bogus'); },
      'No URL was found for [bogus]');
  t.end();
});
