const fs = require('fs');
const request = require('request').defaults({
  forever: true
});
const unirest = require('unirest');
const xray = require('x-ray');
const scrapper = xray();

function requestFile(url) {
  return new Promise((resolve) => {
    request
      .get(url)
      .on('response', (response) => {
        resolve({ href: response.request.href, extension: response.headers['content-type'].replace('image/', '') });
      })
  });
}

function saveFile(data, destination, imageLength, imgListIndex) {
  return new Promise((resolve) => {
    request
      .get(data.href)
      .on('response', () => {
        process.stdout.write(`Unduh : ${data.href}\n`);
      })
      .on('end', () => {
        resolve();
      })
      .pipe(fs.createWriteStream(destination));
  });
}

exports.downloadChapter = (link, destination) => {
  scrapper(link, 'title')((errDownloadChapter, chapterTitle) => {
    if ( ! fs.existsSync(`${destination}/${chapterTitle}`)) {
      fs.mkdirSync(`${destination}/${chapterTitle}`);
    }

    scrapper(link, 'body #readerarea@html')((errDownload, html) => {
      let imageLength = 0;
      scrapper(html, ['img@src'])((errImg, img) => {
        imageLength = img.length;
        if (imageLength > 0) {
          img.forEach((imgList, imgListIndex) => {
            if (imgList !== '') {
              requestFile(imgList)
                .then((data) => {
                  saveFile(data, `${destination}/${chapterTitle}/${imgListIndex}.${data.extension}`, imageLength, imgListIndex)
                    .then(() => {
                      if (imageLength === (imgListIndex + 1)) {
                        process.stdout.write('\n\nUnduhan sudah selesai. Cek apakah file sudah terdownload sempurna pada folder tujuan. Jika sudah tekan CTRL+C untuk keluar.\n\n');
                      }
                    });
                });
            }
          });
        }
      });
    });
  });
};