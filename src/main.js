import './style.css';

// --- LocalStorage Helper ---
function loadState(key, defaultState) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? { ...defaultState, ...JSON.parse(stored) } : defaultState;
  } catch (e) {
    return defaultState;
  }
}

// --- 1. Global App State ---
let originalQuizData = null; // Store unmodified quiz for restarting
let activeQuiz = null;
let activeTerm = "";
let activeCourse = "";
let currentIndex = 0;
let userAnswers = {};

// --- Mode & Options State ---
let activeMode = 'quiz';

// Load from LocalStorage
let appSettings = loadState('quizApp_appSettings', { disableAnimations: false });
let quizOptions = loadState('quizApp_quizOptions', { 
  noSkip: false, 
  hideFeedback: false, 
  hideFeedbackIfExplanation: false,
  hideExplanation: false,
  shuffleQuestions: false, 
  shuffleChoices: false 
});
let reviewOptions = loadState('quizApp_reviewOptions', { showAllChoices: false, hideExplanation: false });

// Apply initial app settings
if (appSettings.disableAnimations) {
  document.body.classList.add('no-animations');
}

// --- 2. Load Data ---
const quizModules = import.meta.glob('./data/**/*.json', { eager: true });
const courseMenu = {};

for (const path in quizModules) {
  const pathParts = path.split('/');
  const term = pathParts[2];
  const course = pathParts[3];
  const quizData = quizModules[path];
  const realTitle = quizData.quizTitle || "Untitled Quiz";
  if (!courseMenu[term]) courseMenu[term] = {};
  if (!courseMenu[term][course]) courseMenu[term][course] = [];
  courseMenu[term][course].push({ title: realTitle, data: quizData });
}

const appRoot = document.getElementById('app-root');

// --- Array Shuffle Helper ---
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// --- 3. Home Screen Menu ---
function renderMenu() {
  appRoot.innerHTML = `
    <header class="quiz-header">
      <h1>Multi Quiz App</h1>
      <div class="header-right">
        <div class="hamburger-wrap">
          <button class="btn-hamburger" onclick="toggleDropdown('menu-dropdown')" aria-label="Settings">
            <span></span><span></span><span></span>
          </button>
          <div id="menu-dropdown" class="dropdown-menu" style="display:none;">
            <div class="dropdown-header">App Settings</div>
            <label class="dropdown-item">
              <span class="dropdown-item-text">
                <strong>Disable animations</strong>
                <small>Turn off all transitions and fades</small>
              </span>
              <input type="checkbox" id="opt-disable-anim" onchange="setAppSetting('disableAnimations', this.checked)" ${appSettings.disableAnimations ? 'checked' : ''}>
            </label>
          </div>
        </div>
      </div>
    </header>
  `;
  const container = document.createElement('main');
  container.className = 'menu-container';

  for (const term in courseMenu) {
    const termSection = document.createElement('section');
    termSection.innerHTML = `<h2>${term}</h2>`;
    for (const course in courseMenu[term]) {
      const courseTitle = document.createElement('h3');
      courseTitle.innerText = course;
      termSection.appendChild(courseTitle);
      const quizList = document.createElement('div');
      quizList.className = 'quiz-list';
      courseMenu[term][course].forEach(quiz => {
        const quizBtn = document.createElement('button');
        quizBtn.className = 'btn-quiz';
        quizBtn.innerText = quiz.title;
        quizBtn.onclick = () => startQuizMode(term, course, quiz.data);
        quizList.appendChild(quizBtn);
      });
      termSection.appendChild(quizList);
    }
    container.appendChild(termSection);
  }
  appRoot.appendChild(container);
}

// --- 3b. Mode Selection (Quiz vs Review) ---
function openModeSelect(term, course, quizData) {
  appRoot.innerHTML = `
    <header class="quiz-header">
      <h1>Multi Quiz App</h1>
    </header>
    <main class="menu-container">
      <section class="mode-select-card">
        <div class="mode-select-title">
          <span class="mode-select-quiz-label">${quizData.quizTitle}</span>
          <span class="mode-select-sub">${term} / ${course}</span>
        </div>
        <div class="mode-select-options">
          <button class="mode-btn mode-btn-quiz" onclick="launchMode('quiz', '${term}', '${course}')">
            <span class="mode-icon">📝</span>
            <span class="mode-btn-label">Quiz Mode</span>
            <span class="mode-btn-desc">Answer questions, get scored</span>
          </button>
          <button class="mode-btn mode-btn-review" onclick="launchMode('review', '${term}', '${course}')">
            <span class="mode-icon">📖</span>
            <span class="mode-btn-label">Review Mode</span>
            <span class="mode-btn-desc">Browse all questions with answers</span>
          </button>
        </div>
        <button class="btn-back" onclick="renderMenu()">← Back</button>
      </section>
    </main>
  `;
  appRoot._pendingData = { term, course, quizData };
}

window.launchMode = (mode, term, course) => {
  const { quizData } = appRoot._pendingData;
  if (mode === 'quiz') startQuizMode(term, course, quizData);
  else startReviewMode(term, course, quizData);
};

// =====================================================
// --- 4A. QUIZ MODE ---
// =====================================================
function startQuizMode(term, course, quizData) {
  originalQuizData = quizData; 
  activeTerm = term;
  activeCourse = course;
  activeMode = 'quiz';
  currentIndex = 0;
  userAnswers = {};

  // Deep clone data to allow shuffling without modifying source
  activeQuiz = JSON.parse(JSON.stringify(quizData));

  // Handle Shuffling
  if (quizOptions.shuffleQuestions) {
    shuffleArray(activeQuiz.questions);
  }
  if (quizOptions.shuffleChoices) {
    activeQuiz.questions.forEach(q => {
      if (q.type === 'mc' || q.type === 'tf') {
        let arr = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correctAnswer }));
        shuffleArray(arr);
        q.options = arr.map(a => a.text);
        q.correctAnswer = arr.findIndex(a => a.isCorrect);
      } else if (q.type === 'matching' || q.type === 'drag-drop') {
        shuffleArray(q.pairs);
      }
    });
  }

  renderQuizShell();
  renderQuestion();
}

function renderQuizShell() {
  appRoot.innerHTML = `
    <header class="quiz-header">
      <div class="header-left">
        <span class="mode-pill mode-pill--quiz">Quiz</span>
        <span class="breadcrumbs">${activeTerm} <span>/</span> ${activeCourse} <span>/</span> ${activeQuiz.quizTitle}</span>
      </div>
      <div class="header-right">
        <div class="progress-wrap">
          <span class="progress-label" id="progress-label">${currentIndex + 1}/${activeQuiz.questions.length}</span>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" id="progress-bar-fill" style="width:${((currentIndex + 1) / activeQuiz.questions.length) * 100}%"></div>
          </div>
        </div>
        <span id="score-badge" class="score-badge">Score: 0</span>
        <button class="btn-restart" onclick="restartQuiz()">Restart</button>
        <button class="btn-exit" onclick="renderMenu()">Exit</button>
        <div class="hamburger-wrap">
          <button class="btn-hamburger" onclick="toggleDropdown('quiz-dropdown')" aria-label="Options">
            <span></span><span></span><span></span>
          </button>
          <div id="quiz-dropdown" class="dropdown-menu" style="display:none;">
            <button class="dropdown-mode-switch" onclick="switchToReview()">Switch to Review Mode →</button>
            <div class="dropdown-divider"></div>
            
            <div class="dropdown-header">Quiz Options</div>
            <label class="dropdown-item">
              <span class="dropdown-item-text">
                <strong>Shuffle questions</strong>
                <small>Randomizes question order (Applies on Restart)</small>
              </span>
              <input type="checkbox" onchange="setQuizOption('shuffleQuestions', this.checked)" ${quizOptions.shuffleQuestions ? 'checked' : ''}>
            </label>
            <label class="dropdown-item">
              <span class="dropdown-item-text">
                <strong>Shuffle choices</strong>
                <small>Randomizes choice order (Applies on Restart)</small>
              </span>
              <input type="checkbox" onchange="setQuizOption('shuffleChoices', this.checked)" ${quizOptions.shuffleChoices ? 'checked' : ''}>
            </label>
            <label class="dropdown-item">
              <span class="dropdown-item-text">
                <strong>Hide feedback</strong>
                <small>Don't show correct/incorrect banner</small>
              </span>
              <input type="checkbox" onchange="setQuizOption('hideFeedback', this.checked)" ${quizOptions.hideFeedback ? 'checked' : ''}>
            </label>
            <label class="dropdown-item">
              <span class="dropdown-item-text">
                <strong>Hide explanation</strong>
                <small>Don't show the explanation text</small>
              </span>
              <input type="checkbox" onchange="setQuizOption('hideExplanation', this.checked)" ${quizOptions.hideExplanation ? 'checked' : ''}>
            </label>
            <label class="dropdown-item">
              <span class="dropdown-item-text">
                <strong>Skip feedback</strong>
                <small>Hide banner if explanation exists</small>
              </span>
              <input type="checkbox" onchange="setQuizOption('hideFeedbackIfExplanation', this.checked)" ${quizOptions.hideFeedbackIfExplanation ? 'checked' : ''}>
            </label>
            <label class="dropdown-item">
              <span class="dropdown-item-text">
                <strong>Disable navigation</strong>
                <small>Must answer before moving forward</small>
              </span>
              <input type="checkbox" onchange="setQuizOption('noSkip', this.checked)" ${quizOptions.noSkip ? 'checked' : ''}>
            </label>
            
            <div class="dropdown-divider"></div>
            <div class="dropdown-header">App Settings</div>
            <label class="dropdown-item">
              <span class="dropdown-item-text">
                <strong>Disable animations</strong>
                <small>Turn off all transitions and fades</small>
              </span>
              <input type="checkbox" onchange="setAppSetting('disableAnimations', this.checked)" ${appSettings.disableAnimations ? 'checked' : ''}>
            </label>
          </div>
        </div>
      </div>
    </header>
    <main id="quiz-container"></main>
    <footer id="quiz-nav" class="nav-row"></footer>
  `;
}

function renderQuestion() {
  const container = document.getElementById('quiz-container');
  const nav = document.getElementById('quiz-nav');

  const lbl = document.getElementById('progress-label');
  const fill = document.getElementById('progress-bar-fill');
  if (lbl) lbl.innerText = `${currentIndex + 1}/${activeQuiz.questions.length}`;
  if (fill) fill.style.width = `${((currentIndex + 1) / activeQuiz.questions.length) * 100}%`;

  const question = activeQuiz.questions[currentIndex];
  const savedState = userAnswers[question.id] || { value: null, submitted: false };
  const isLocked = savedState.submitted;

  const typeMap = {
    'mc': 'Multiple Choice', 'tf': 'True / False',
    'fitb': 'Fill in the Blank', 'matching': 'Dropdown Matching', 'drag-drop': 'Drag & Drop'
  };

  let html = `
    <div class="question-card">
      <div class="q-meta">
        <div class="q-meta-left">
          <span class="q-num-badge">${currentIndex + 1}</span>
          <span class="q-type-badge ${question.type}">${typeMap[question.type] || 'Question'}</span>
        </div>
        <span class="q-points">${question.points || 1} pts</span>
      </div>
      ${question.context ? `<div class="q-context"><div class="q-context-body">${question.context}</div></div>` : ''}
      <div class="q-text">${question.text}</div>
      <div class="options-list">
  `;

  switch (question.type) {
    case 'mc':
    case 'tf':
      question.options.forEach((opt, idx) => {
        const isChecked = savedState.value === idx ? 'checked' : '';
        let statusClass = '';
        if (isLocked) {
          if (idx === question.correctAnswer) statusClass = 'reveal-correct';
          else if (savedState.value === idx) statusClass = 'reveal-wrong';
        }
        html += `
          <label class="option-label ${statusClass} ${isLocked ? 'locked' : ''}">
            <input type="radio" name="q${question.id}" value="${idx}" ${isChecked}
                   ${isLocked ? 'disabled' : ''}
                   onchange="saveAndSubmitMC(${question.id}, ${idx})">
            <span>${opt}</span>
          </label>
        `;
      });
      break;

    case 'fitb': {
      const savedText = savedState.value || '';
      let fitbClass = '';
      if (isLocked) fitbClass = savedText.trim().toLowerCase() === question.correctAnswer.toLowerCase() ? 'fitb-correct' : 'fitb-wrong';
      html += `
        <div class="fitb-row">
          <input type="text" class="fitb-input ${fitbClass}" value="${savedText}"
                 ${isLocked ? 'disabled' : ''}
                 oninput="saveAnswer(${question.id}, this.value)"
                 placeholder="Type your answer...">
          ${!isLocked ? `<button class="btn-check" onclick="checkAnswer(${question.id})">Check ✓</button>` : ''}
        </div>
      `;
      break;
    }

    case 'matching': {
      const savedDropdowns = savedState.value || {};
      const allChoices = question.allChoices || question.pairs.map(p => p.match);
      html += `<div class="matching-grid">`;
      question.pairs.forEach(pair => {
        const selectedVal = savedDropdowns[pair.term] || '';
        let matchClass = '';
        if (isLocked) matchClass = selectedVal === pair.match ? 'match-correct' : 'match-wrong';
        html += `
          <div class="match-row">
            <div class="match-term">${pair.term}</div>
            <select class="match-select ${matchClass}" ${isLocked ? 'disabled' : ''}
                    onchange="saveDropdownState(${question.id}, '${pair.term}', this.value)">
              <option value="">-- select --</option>
              ${allChoices.map(c => `<option value="${c}" ${selectedVal === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
        `;
      });
      html += `</div>`;
      if (!isLocked) html += `<button class="btn-check" style="margin-top:1rem;" onclick="checkAnswer(${question.id})">Check Answers ✓</button>`;
      break;
    }

    case 'drag-drop': {
      const allMatches = question.pairs.map(p => p.match);
      const savedMatches = savedState.value || {};
      html += `<div class="matching-container">`;
      if (!isLocked) {
        html += `<div class="items-bank" id="items-bank">`;
        allMatches.forEach(matchText => {
          if (!Object.values(savedMatches).includes(matchText))
            html += `<div class="drag-item" draggable="true" data-match="${matchText}">${matchText}</div>`;
        });
        html += `</div>`;
      }
      html += `<div class="matching-grid">`;
      question.pairs.forEach(pair => {
        const placedItem = savedMatches[pair.term];
        let dropClass = '';
        if (isLocked) dropClass = placedItem === pair.match ? 'match-correct' : 'match-wrong';
        html += `
          <div class="match-row">
            <div class="match-term">${pair.term}</div>
            <div class="drop-zone ${dropClass}" data-term="${pair.term}">
              ${placedItem ? `<div class="drag-item" ${isLocked ? '' : 'draggable="true"'} data-match="${placedItem}">${placedItem}</div>` : ''}
            </div>
          </div>
        `;
      });
      html += `</div></div>`;
      if (!isLocked) html += `<button class="btn-check" style="margin-top:1rem;" onclick="checkAnswer(${question.id})">Check Answers ✓</button>`;
      break;
    }
  }

  if (isLocked) {
    let isPerfect = false;
    let expectedText = '';
    if (question.type === 'mc' || question.type === 'tf') {
      isPerfect = savedState.value === question.correctAnswer;
      expectedText = question.options[question.correctAnswer];
    } else if (question.type === 'fitb') {
      isPerfect = savedState.value && savedState.value.trim().toLowerCase() === question.correctAnswer.toLowerCase();
      expectedText = question.correctAnswer;
    } else {
      let correctCount = 0;
      question.pairs.forEach(pair => { if (savedState.value && savedState.value[pair.term] === pair.match) correctCount++; });
      isPerfect = correctCount === question.pairs.length;
      expectedText = "Review the highlighted answers.";
    }

    let showExplanation = question.explanation && !quizOptions.hideExplanation;
    let showFeedback = !quizOptions.hideFeedback;
    
    if (quizOptions.hideFeedbackIfExplanation && showExplanation) {
      showFeedback = false;
    }

    if (showFeedback) {
      html += `
        <div class="feedback-banner ${isPerfect ? 'correct' : 'wrong'}">
          <strong>${isPerfect ? '✓ Correct!' : '✗ Incorrect.'}</strong>
          ${!isPerfect && expectedText ? `<br>Expected: ${expectedText}` : ''}
        </div>
      `;
    }

    if (showExplanation) {
      html += `
        <div class="q-explanation">
          <span class="q-explanation-label">Explanation</span>
          <div class="q-explanation-text">${question.explanation}</div>
        </div>
      `;
    }
  }

  html += `</div></div>`;
  container.innerHTML = html;

  if (question.type === 'drag-drop' && !isLocked) setupDragAndDrop(question.id);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === activeQuiz.questions.length - 1;
  const nextBlocked = quizOptions.noSkip && !savedState.submitted;

  nav.innerHTML = `
    <button class="btn-prev" onclick="prevQ()" ${isFirst ? 'disabled' : ''}>← Previous</button>
    ${isLast
      ? `<button class="btn-next" onclick="submitQuiz()" ${nextBlocked ? 'disabled title="Answer this question first"' : ''}>Finish Quiz ✓</button>`
      : `<button class="btn-next" onclick="nextQ()" ${nextBlocked ? 'disabled title="Answer this question first"' : ''}>Next →</button>`
    }
  `;
}

// =====================================================
// --- 4B. REVIEW MODE ---
// =====================================================
function startReviewMode(term, course, quizData) {
  originalQuizData = quizData; 
  activeQuiz = JSON.parse(JSON.stringify(quizData));
  activeTerm = term;
  activeCourse = course;
  activeMode = 'review';
  currentIndex = 0;

  renderReviewShell();
  renderReviewQuestion();
}

function renderReviewShell() {
  appRoot.innerHTML = `
    <header class="quiz-header">
      <div class="header-left">
        <span class="mode-pill mode-pill--review">Review</span>
        <span class="breadcrumbs">${activeTerm} <span>/</span> ${activeCourse} <span>/</span> ${activeQuiz.quizTitle}</span>
      </div>
      <div class="header-right">
        <div class="progress-wrap">
          <span class="progress-label" id="progress-label">${currentIndex + 1}/${activeQuiz.questions.length}</span>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" id="progress-bar-fill" style="width:${((currentIndex + 1) / activeQuiz.questions.length) * 100}%"></div>
          </div>
        </div>
        <button class="btn-restart" onclick="restartQuiz()">Restart</button>
        <button class="btn-exit" onclick="renderMenu()">Exit</button>
        <div class="hamburger-wrap">
          <button class="btn-hamburger" onclick="toggleDropdown('review-dropdown')" aria-label="Options">
            <span></span><span></span><span></span>
          </button>
          <div id="review-dropdown" class="dropdown-menu" style="display:none;">
            <button class="dropdown-mode-switch" onclick="switchToQuiz()">Switch to Quiz Mode →</button>
            <div class="dropdown-divider"></div>
            
            <div class="dropdown-header">Review Options</div>
            <label class="dropdown-item">
              <span class="dropdown-item-text">
                <strong>Show all choices</strong>
                <small>Display all options, not just the answer</small>
              </span>
              <input type="checkbox" id="opt-allchoices" onchange="setReviewOption('showAllChoices', this.checked)" ${reviewOptions.showAllChoices ? 'checked' : ''}>
            </label>
            <label class="dropdown-item">
              <span class="dropdown-item-text">
                <strong>Hide explanation</strong>
                <small>Don't show the explanation text</small>
              </span>
              <input type="checkbox" onchange="setReviewOption('hideExplanation', this.checked)" ${reviewOptions.hideExplanation ? 'checked' : ''}>
            </label>
            
            <div class="dropdown-divider"></div>
            <div class="dropdown-header">App Settings</div>
            <label class="dropdown-item">
              <span class="dropdown-item-text">
                <strong>Disable animations</strong>
                <small>Turn off all transitions and fades</small>
              </span>
              <input type="checkbox" onchange="setAppSetting('disableAnimations', this.checked)" ${appSettings.disableAnimations ? 'checked' : ''}>
            </label>
          </div>
        </div>
      </div>
    </header>
    <main id="quiz-container"></main>
    <footer id="quiz-nav" class="nav-row"></footer>
  `;
}

function renderReviewQuestion() {
  const container = document.getElementById('quiz-container');
  const nav = document.getElementById('quiz-nav');

  const lbl = document.getElementById('progress-label');
  const fill = document.getElementById('progress-bar-fill');
  if (lbl) lbl.innerText = `${currentIndex + 1}/${activeQuiz.questions.length}`;
  if (fill) fill.style.width = `${((currentIndex + 1) / activeQuiz.questions.length) * 100}%`;

  const question = activeQuiz.questions[currentIndex];
  const typeMap = {
    'mc': 'Multiple Choice', 'tf': 'True / False',
    'fitb': 'Fill in the Blank', 'matching': 'Dropdown Matching', 'drag-drop': 'Drag & Drop'
  };

  let html = `
    <div class="question-card question-card--review">
      <div class="q-meta">
        <div class="q-meta-left">
          <span class="q-num-badge">${currentIndex + 1}</span>
          <span class="q-type-badge ${question.type}">${typeMap[question.type] || 'Question'}</span>
        </div>
        <span class="q-points">${question.points || 1} pts</span>
      </div>
      ${question.context ? `<div class="q-context"><div class="q-context-body">${question.context}</div></div>` : ''}
      <div class="q-text">${question.text}</div>
      <div class="options-list">
  `;

  if (question.type === 'mc' || question.type === 'tf') {
    if (reviewOptions.showAllChoices) {
      question.options.forEach((opt, idx) => {
        const isCorrect = idx === question.correctAnswer;
        html += `
          <div class="option-label locked ${isCorrect ? 'reveal-correct' : ''}">
            ${isCorrect ? '' : '<span style="width:18px;height:18px;flex-shrink:0;margin-right:0.5rem;"></span>'}
            <span>${opt}</span>
          </div>
        `;
      });
    } else {
      html += `
        <div class="review-answer-block">
          <span class="review-answer-label">Correct Answer</span>
          <div class="review-answer-value">${question.options[question.correctAnswer]}</div>
        </div>
      `;
    }
  } else if (question.type === 'fitb') {
    html += `
      <div class="review-answer-block">
        <span class="review-answer-label">Correct Answer</span>
        <div class="review-answer-value">${question.correctAnswer}</div>
      </div>
    `;
  } else if (question.type === 'matching' || question.type === 'drag-drop') {
    html += `<div class="matching-grid review-matching">`;
    question.pairs.forEach(pair => {
      html += `
        <div class="match-row">
          <div class="match-term">${pair.term}</div>
          <div class="match-answer match-correct">${pair.match}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  html += `</div></div></div>`;
  
  if (question.explanation && !reviewOptions.hideExplanation) {
    html += `
      <div class="q-explanation">
        <span class="q-explanation-label">Explanation</span>
        <div class="q-explanation-text">${question.explanation}</div>
      </div>
    `;
  }
  container.innerHTML = html;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === activeQuiz.questions.length - 1;

  nav.innerHTML = `
    <button class="btn-prev" onclick="prevQ()" ${isFirst ? 'disabled' : ''}>← Previous</button>
    ${isLast
      ? `<button class="btn-next" onclick="renderMenu()">Done ✓</button>`
      : `<button class="btn-next" onclick="nextQ()">Next →</button>`
    }
  `;
}

// =====================================================
// --- 5. Drag & Drop Engine ---
// =====================================================
window.setupDragAndDrop = (qId) => {
  const dragItems = document.querySelectorAll('.drag-item');
  const dropZones = document.querySelectorAll('.drop-zone, .items-bank');
  let draggedItem = null;

  dragItems.forEach(item => {
    item.addEventListener('dragstart', function() {
      draggedItem = this;
      setTimeout(() => this.classList.add('dragging'), 0);
    });
    item.addEventListener('dragend', function() {
      this.classList.remove('dragging');
      draggedItem = null;
      saveDragDropState(qId);
    });
  });

  dropZones.forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      if (draggedItem) {
        if (zone.classList.contains('drop-zone') && zone.children.length > 0)
          document.getElementById('items-bank').appendChild(zone.children[0]);
        zone.appendChild(draggedItem);
      }
    });
  });
};

// =====================================================
// --- 6. State Helpers ---
// =====================================================
window.saveDragDropState = (qId) => {
  const dropZones = document.querySelectorAll('.drop-zone');
  const currentState = {};
  dropZones.forEach(zone => {
    const term = zone.getAttribute('data-term');
    const item = zone.querySelector('.drag-item');
    if (item) currentState[term] = item.getAttribute('data-match');
  });
  if (!userAnswers[qId]) userAnswers[qId] = { value: null, submitted: false };
  userAnswers[qId].value = currentState;
};

window.saveDropdownState = (qId, term, value) => {
  if (!userAnswers[qId]) userAnswers[qId] = { value: {}, submitted: false };
  if (!userAnswers[qId].value) userAnswers[qId].value = {};
  userAnswers[qId].value[term] = value;
};

window.saveAnswer = (qId, answer) => {
  if (!userAnswers[qId]) userAnswers[qId] = { value: null, submitted: false };
  userAnswers[qId].value = answer;
};

window.checkAnswer = (qId) => {
  if (userAnswers[qId]) {
    userAnswers[qId].submitted = true;
    updateScore();
    renderQuestion();
  }
};

window.saveAndSubmitMC = (qId, idx) => {
  userAnswers[qId] = { value: idx, submitted: true };
  updateScore();
  renderQuestion();
};

function navigateWithAnimation(fn) {
  if (appSettings.disableAnimations) { fn(); return; }
  const card = document.querySelector('.question-card');
  if (card) {
    card.classList.add('question-card--exiting');
    setTimeout(fn, 95);
  } else {
    fn();
  }
}

window.nextQ = () => {
  navigateWithAnimation(() => {
    currentIndex++;
    activeMode === 'review' ? renderReviewQuestion() : renderQuestion();
  });
};

window.prevQ = () => {
  navigateWithAnimation(() => {
    currentIndex--;
    activeMode === 'review' ? renderReviewQuestion() : renderQuestion();
  });
};

window.restartQuiz = () => {
  if (activeMode === 'quiz') startQuizMode(activeTerm, activeCourse, originalQuizData);
  else startReviewMode(activeTerm, activeCourse, originalQuizData);
};

// =====================================================
window.toggleDropdown = (id) => {
  const menu = document.getElementById(id);
  if (!menu) return;
  const isOpen = menu.classList.contains('dropdown-menu--open');

  document.querySelectorAll('.dropdown-menu--open').forEach(m => {
    m.classList.remove('dropdown-menu--open');
    m.classList.add('dropdown-menu--closing');
    setTimeout(() => { m.classList.remove('dropdown-menu--closing'); m.style.display = 'none'; }, 140);
  });

  if (!isOpen) {
    menu.style.display = 'block';
    requestAnimationFrame(() => menu.classList.add('dropdown-menu--open'));
  }
};

document.addEventListener('click', (e) => {
  if (!e.target.closest('.hamburger-wrap')) {
    document.querySelectorAll('.dropdown-menu--open').forEach(m => {
      m.classList.remove('dropdown-menu--open');
      m.classList.add('dropdown-menu--closing');
      setTimeout(() => { m.classList.remove('dropdown-menu--closing'); m.style.display = 'none'; }, 140);
    });
  }
});

function exitToMenu() {
  if (appSettings.disableAnimations) { renderMenu(); return; }
  const root = document.getElementById('app-root');
  root.classList.add('app-exiting');
  setTimeout(() => {
    root.classList.remove('app-exiting');
    renderMenu();
  }, 200);
}

window.renderMenu = () => exitToMenu();

// Settings & Options persistence
window.setAppSetting = (key, value) => {
  appSettings[key] = value;
  localStorage.setItem('quizApp_appSettings', JSON.stringify(appSettings));
  if (key === 'disableAnimations') {
    document.body.classList.toggle('no-animations', value);
  }
};

window.setQuizOption = (key, value) => {
  quizOptions[key] = value;
  localStorage.setItem('quizApp_quizOptions', JSON.stringify(quizOptions));
  renderQuestion();
};

window.setReviewOption = (key, value) => {
  reviewOptions[key] = value;
  localStorage.setItem('quizApp_reviewOptions', JSON.stringify(reviewOptions));
  renderReviewQuestion();
  const cb = document.getElementById('opt-allchoices');
  if (cb) cb.checked = reviewOptions[key];
};

window.switchToReview = () => {
  startReviewMode(activeTerm, activeCourse, activeQuiz);
};

window.switchToQuiz = () => {
  startQuizMode(activeTerm, activeCourse, activeQuiz);
};

// =====================================================
// --- 8. Quiz Grader ---
// =====================================================
window.submitQuiz = () => {
  let score = 0;
  let totalPossible = 0;

  activeQuiz.questions.forEach(q => {
    const pts = q.points || 1;
    totalPossible += pts;
    const userAnswer = userAnswers[q.id]?.value ?? null;
    if (q.type === 'mc' || q.type === 'tf') {
      if (userAnswer === q.correctAnswer) score += pts;
    } else if (q.type === 'fitb') {
      if (userAnswer && userAnswer.trim().toLowerCase() === q.correctAnswer.toLowerCase()) score += pts;
    } else if (q.type === 'matching' || q.type === 'drag-drop') {
      const ppp = pts / q.pairs.length;
      q.pairs.forEach(pair => { if (userAnswer && userAnswer[pair.term] === pair.match) score += ppp; });
    }
  });

  const percentage = Math.round((score / totalPossible) * 100);

  appRoot.innerHTML = `
    <header class="quiz-header quiz-header--quiz">
      <div class="header-left">
        <span class="mode-pill mode-pill--quiz">Quiz</span>
        <span class="breadcrumbs">${activeTerm} <span>/</span> ${activeCourse} <span>/</span> ${activeQuiz.quizTitle}</span>
      </div>
      <div class="header-right">
        <button class="btn-restart" onclick="restartQuiz()">Restart Quiz</button>
        <button class="btn-exit" onclick="renderMenu()">← Home</button>
      </div>
    </header>
    <main class="question-card" style="text-align: center; margin-top: 2rem;">
      <h2 class="result-score">${percentage}%</h2>
      <h3>You scored ${score} out of ${totalPossible} points</h3>
      <br><br>
      <button class="btn-next" onclick="renderMenu()">Return to Main Menu</button>
    </main>
  `;
};

window.updateScore = () => {
  let score = 0;
  activeQuiz.questions.forEach(q => {
    const data = userAnswers[q.id];
    if (data?.submitted) {
      if ((q.type === 'mc' || q.type === 'tf') && data.value === q.correctAnswer) score += (q.points || 1);
      else if (q.type === 'fitb' && data.value?.trim().toLowerCase() === q.correctAnswer.toLowerCase()) score += (q.points || 1);
      else if ((q.type === 'matching' || q.type === 'drag-drop') && data.value) {
        const pps = (q.points || 1) / q.pairs.length;
        q.pairs.forEach(pair => { if (data.value[pair.term] === pair.match) score += pps; });
      }
    }
  });
  const el = document.getElementById('score-badge');
  if (el) el.innerText = `Score: ${Math.round(score)}`;
};

// --- 9. Boot ---
renderMenu();