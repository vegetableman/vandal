const captureWebsite = require('capture-website');

const options = {
  width: 1024,
  height: 768
};

const items = [
  'https://web.archive.org/web/20190116105743im_/https://scroll.in/',
  'https://web.archive.org/web/20190116105743im_/https://scroll.in/'
  // 'https://web.archive.org/web/19981202230410im_/http://www.google.com:80/',

  // 'https://web.archive.org/web/19991129021746im_/http://www13.google.com:80/',

  // 'https://web.archive.org/web/20001203022500im_/http://www.google.com:80/',

  // 'https://web.archive.org/web/20011201082439im_/http://www.google.com:80/',

  // 'https://web.archive.org/web/20021130081132im_/http://www.google.com:80/',

  // 'https://web.archive.org/web/20031130200755im_/http://www.google.com',

  // 'https://web.archive.org/web/20041130132508im_/http://www.google.com/',

  // 'https://web.archive.org/web/20051201111118im_/http://www.google.com/',

  // 'https://web.archive.org/web/20061201030432im_/http://www.google.com/',

  // 'https://web.archive.org/web/20071130180706im_/http://www.google.com',

  // 'https://web.archive.org/web/20081201005019im_/http://www.google.com/',

  // 'https://web.archive.org/web/20091201040956im_/http://www.google.com/',

  // 'https://web.archive.org/web/20101130235215im_/http://www.google.com/',

  // 'https://web.archive.org/web/20111201001107im_/http://www.google.com/',

  // 'https://web.archive.org/web/20121201002305im_/https://www.google.com/',

  // 'https://web.archive.org/web/20131130235053im_/http://www.google.com/',

  // 'https://web.archive.org/web/20141130235417im_/https://www.google.com/',

  // 'https://web.archive.org/web/20151201000127im_/https://www.google.com/',

  // 'https://web.archive.org/web/20161201000202im_/http://www.google.com/',

  // 'https://web.archive.org/web/20171201000104im_/http://www.google.com/',

  // 'https://web.archive.org/web/20181201000036im_/https://www.google.com/',

  // 'https://web.archive.org/web/20190224094753im_/https://www.google.com/'
];

(async () => {
  await Promise.all(
    items.map((url, index) => {
      return captureWebsite.file(url, `images/${url}.png`, options);
    })
  );
})();
