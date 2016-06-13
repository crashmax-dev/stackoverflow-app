const moment = require('moment');
const ipcRenderer = require('electron').ipcRenderer;
const stackexchange = require('./stackexchange-api');
const questionScreenService = require('./question-screen-service');

let questionScreenBackdrop = document.querySelector('.question-screen-backdrop');
let questionScreen = document.querySelector('.question-screen');

const countInString = (needly, haystack) => {
  var results = 0;
  var a = haystack.indexOf(needly);

  while (a != -1) {
    haystack = haystack.slice(a * 1 + needly.length);
    results++;
    a = haystack.indexOf(needly);
  }

  return results;
};

ipcRenderer.on('stackexchange:login', (event, data) => {
  stackexchange
    .fetch('questions/unanswered/my-tags', {
      order: 'desc',
      sort: 'creation',
      access_token: data.token,
      filter: '!.Iwe-BCqk3L4jlmCTCqYbursXuIE_'
    })
    .then((response) => {
      let questions = response.items;
      let questionsElements = [];

      document.querySelector('#answer-questions-section').innerHTML = '';

      questions.forEach((question) => {
        const timeAgo = moment(question.creation_date * 1000).fromNow();
        let questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.question = question;

        // TODO generate question short info
        const paragraphs = countInString('</p>', question.body);
        const codeBlocks = countInString('</pre>', question.body);
        const fiddles = countInString('jsfiddle.net', question.body);
        const images = countInString('i.stack.imgur.com', question.body) / 2; // Divide by 2 because images are wrapped to <a> with the same url
        // Reduce fiddles and images count because they counts like links
        const links = countInString('</a>', question.body) - fiddles - images;

        let questionInfo = `${paragraphs ? paragraphs + ' paragraphs, ' : ''}` +
          `${codeBlocks ? codeBlocks + ' code-blocks, ' : ''}` +
          `${links ? links + ' links, ' : ''}` +
          `${fiddles ? fiddles + ' JS Fiddle, ' : ''}`;

        // Clear ', ' in the end
        questionInfo = questionInfo.substring(0, questionInfo.length - 2);

        questionElement.innerHTML = `
          <div class="question-title">${question.title}</div>
          <div class="question-info">${questionInfo}</div>
          <ul class="question-tags">
            ${question.tags.map((tag) => `<li>${tag}</li>`).join(' ')}
          </ul>
          <span class="question-time">
            ${timeAgo}
            <a tabindex="-1" href="${question.owner.link}">${question.owner.display_name}</a>
          </span>
      `;

        document.querySelector('#answer-questions-section').appendChild(questionElement);
        questionsElements.push(questionElement);
      });

      // Open question on click
      questionsElements.forEach((questionElement) => {
        questionElement.addEventListener('click', () => {
          questionScreenBackdrop.classList.add('is-shown');
          questionScreen.classList.add('is-shown');
          questionScreenService.renderQuestion(questionElement.question, data.token);
        });
      });

      // Close question screen on click outside
      questionScreenBackdrop.addEventListener('click', () => {
        questionScreenBackdrop.classList.remove('is-shown');
        questionScreen.classList.remove('is-shown');
        questionScreenService.clearScreen();
      });
    });
});