const prompts = require('prompts');

const action = require('./dist/scrapper');

async function downloadChapter() {
  let questions = [
    {
      type: 'text',
      name: 'url',
      message: 'Chapter link from Komikcast?'
    },
    {
      type: 'text',
      name: 'destination',
      message: 'Destination save path?'
    }
  ];
  
  let response = await prompts(questions);
  if (response.url !== null && response.destination !== null) action.downloadChapter(response.url, response.destination);
};

downloadChapter();