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
let appSettings = loadState('quizApp_appSettings', {
  disableAnimations: false,
  navLocation: 'down', // 'down', 'up', 'both'
  theme: 'default',    // <-- NEW THEME SETTING
  compactMode: false
});
let quizOptions = loadState('quizApp_quizOptions', { 
  noSkip: false, 
  hideFeedback: false, 
  hideFeedbackIfExplanation: false,
  hideExplanation: false,
  shuffleQuestions: false, 
  shuffleChoices: false 
});
let reviewOptions = loadState('quizApp_reviewOptions', {
  showAllChoices: false,
  hideExplanation: false,
  listView: false
});
let collapsedTerms = loadState('quizApp_collapsedTerms', {});

// Apply initial app settings
if (appSettings.disableAnimations) {
  document.body.classList.add('no-animations');
}

if (appSettings.compactMode) {
  document.body.classList.add('compact-mode');
}

if (appSettings.theme && appSettings.theme !== 'default') {
  document.body.classList.add(`theme-${appSettings.theme}`);
}

// --- Navigation Helper ---
function renderNavRow(isFirst, isLast, nextBlocked, isQuizMode) {
  let html = '';
  let prevBtn = '';
  let nextBtn = '';
  const isListView = activeMode === 'review' && reviewOptions.listView;

  if (isListView) {
    html = `<button class="btn-next" style="margin-left:auto;" onclick="renderMenu()">Done ✓</button>`;
  } else {
    prevBtn = `<button class="btn-prev" onclick="prevQ()" ${isFirst ? 'disabled' : ''}>← Previous</button>`;

    let nextAction, nextLabel;
    if (isLast) {
      nextAction = isQuizMode ? 'confirmSubmitQuiz()' : 'renderMenu()';
      nextLabel = isQuizMode ? 'Finish Quiz ✓' : 'Done ✓';
    } else {
      nextAction = 'nextQ()';
      nextLabel = 'Next →';
    }

    const disabledAttr = (isQuizMode && nextBlocked) ? 'disabled title="Answer this question first"' : '';
    nextBtn = `<button class="btn-next" onclick="${nextAction}" ${disabledAttr}>${nextLabel}</button>`;

    html = `${prevBtn}${nextBtn}`;
  }

  const navTop = document.getElementById('quiz-nav-top');
  const navBottom = document.getElementById('quiz-nav-bottom');
  const positions = NAV_POSITION_MAP[appSettings.navLocation] || ['bottom'];

  if (navTop) {
    navTop.innerHTML = html;
    navTop.style.display = positions.includes('top') ? 'flex' : 'none';
  }
  if (navBottom) {
    navBottom.innerHTML = html;
    navBottom.style.display = positions.includes('bottom') ? 'flex' : 'none';
  }

  hideSideNav();

  if (!isListView && positions.includes('center')) {
    navSideLeft.innerHTML = prevBtn;
    navSideRight.innerHTML = nextBtn;
    navSideLeft.style.display = 'flex';
    navSideRight.style.display = 'flex';
  } else if (!isListView && positions.includes('sides')) {
    navNearLeft.innerHTML = prevBtn;
    navNearRight.innerHTML = nextBtn;
    navNearLeft.style.display = 'flex';
    navNearRight.style.display = 'flex';
    positionNearNav();
  }
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

// Fixed, viewport-centered Prev/Next buttons (appended to body, not
// app-root, so they stay put regardless of app-root's exit-fade transform)
const navSideLeft = document.createElement('div');
navSideLeft.id = 'quiz-nav-side-left';
navSideLeft.className = 'nav-side nav-side-left';
document.body.appendChild(navSideLeft);

const navSideRight = document.createElement('div');
navSideRight.id = 'quiz-nav-side-right';
navSideRight.className = 'nav-side nav-side-right';
document.body.appendChild(navSideRight);

// Same idea, but hugging the question card's own edges instead of the viewport's
const navNearLeft = document.createElement('div');
navNearLeft.id = 'quiz-nav-near-left';
navNearLeft.className = 'nav-side nav-near';
document.body.appendChild(navNearLeft);

const navNearRight = document.createElement('div');
navNearRight.id = 'quiz-nav-near-right';
navNearRight.className = 'nav-side nav-near';
document.body.appendChild(navNearRight);

function positionNearNav() {
  const card = document.querySelector('.question-card');
  if (!card || navNearLeft.style.display !== 'flex') return;
  const rect = card.getBoundingClientRect();
  const gap = 16;
  navNearLeft.style.left = Math.max(8, rect.left - navNearLeft.offsetWidth - gap) + 'px';
  navNearRight.style.left = (rect.right + gap) + 'px';
}

window.addEventListener('resize', positionNearNav);

function hideSideNav() {
  navSideLeft.style.display = 'none';
  navSideRight.style.display = 'none';
  navSideLeft.innerHTML = '';
  navSideRight.innerHTML = '';
  navNearLeft.style.display = 'none';
  navNearRight.style.display = 'none';
  navNearLeft.innerHTML = '';
  navNearRight.innerHTML = '';
}

function renderSwitch(onchange, checked, id) {
  return `<span class="switch"><input type="checkbox" ${id ? `id="${id}"` : ''} onchange="${onchange}" ${checked ? 'checked' : ''}><span class="switch-track"><span class="switch-thumb"></span></span></span>`;
}

const THEME_MODE_ICONS = {
  default: '☀️',
  canvas: '☀️',
  'dark-purple': '🌙'
};

const NAV_POSITION_MAP = {
  up: ['top'],
  down: ['bottom'],
  sides: ['sides'],
  center: ['center'],
  both: ['top', 'bottom'],
  all: ['top', 'bottom', 'center']
};

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
  hideSideNav();
  appRoot.innerHTML = `
    <header class="quiz-header">
      <h1>Multi Quiz App</h1>
      <div class="header-right">

        <div class="hamburger-wrap">
          <button class="btn-hamburger" onclick="toggleDropdown('menu-dropdown')" aria-label="Settings">
            <span></span><span></span><span></span>
          </button>
          <div id="menu-dropdown" class="dropdown-menu" style="display:none;">
            <div class="dropdown-close-row">
              <button class="modal-close" onclick="toggleDropdown('menu-dropdown')" aria-label="Close">✕</button>
            </div>
            <div class="dropdown-header" onclick="toggleCategory(this)">App Settings</div>
            <div class="dropdown-category-content">
              <label class="dropdown-item" style="flex-direction: column; align-items: flex-start; gap: 0.5rem;">
                <span class="dropdown-item-text">
                  <strong>UI Theme</strong>
                  <small>Switch app appearance</small>
                </span>
                <select onchange="setAppSetting('theme', this.value)" style="width: 100%; padding: 0.4rem; border: 1px solid var(--border); border-radius: 6px;">
                  <option value="default" ${appSettings.theme === 'default' ? 'selected' : ''}>${THEME_MODE_ICONS.default} Misty Blue</option>
                  <option value="canvas" ${appSettings.theme === 'canvas' ? 'selected' : ''}>${THEME_MODE_ICONS.canvas} Canvas</option>
                  <option value="dark-purple" ${appSettings.theme === 'dark-purple' ? 'selected' : ''}>${THEME_MODE_ICONS['dark-purple']} Dark Purple</option>
                </select>
              </label>
              <label class="dropdown-item">
                <span class="dropdown-item-text">
                  <strong>Disable animations</strong>
                  <small>Turn off all transitions and fades</small>
                </span>
                ${renderSwitch("setAppSetting('disableAnimations', this.checked)", appSettings.disableAnimations, 'opt-disable-anim')}
              </label>
              <label class="dropdown-item">
                <span class="dropdown-item-text">
                  <strong>Compact mode</strong>
                  <small>Tighter spacing, less scrolling</small>
                </span>
                ${renderSwitch("setAppSetting('compactMode', this.checked)", appSettings.compactMode)}
              </label>
            </div>
          </div>
        </div>

      </div>
    </header>
  `;
  const container = document.createElement('main');
  container.className = 'menu-container';

  const sortedTerms = Object.keys(courseMenu).sort((a, b) => {
    const numsA = a.match(/\d+/g)?.map(Number) || [];
    const numsB = b.match(/\d+/g)?.map(Number) || [];
    const yearA = numsA[0] ?? 0;
    const yearB = numsB[0] ?? 0;
    if (yearB !== yearA) return yearB - yearA; // newest year first
    return (numsA[1] ?? 0) - (numsB[1] ?? 0); // then term ascending
  });

  for (const term of sortedTerms) {
    const isCollapsed = !!collapsedTerms[term];
    const termSection = document.createElement('section');
    termSection.className = 'term-section' + (isCollapsed ? ' collapsed' : '');

    const termQuizCount = Object.values(courseMenu[term])
      .reduce((sum, quizzes) => sum + quizzes.length, 0);

    const termHeader = document.createElement('h2');
    termHeader.className = 'term-header';
    termHeader.innerHTML = `
      <span class="term-toggle-icon">▾</span>
      <span class="term-title-text">${term}</span>
      <span class="term-count">${termQuizCount} ${termQuizCount === 1 ? 'quiz' : 'quizzes'}</span>
    `;
    termHeader.onclick = () => toggleTerm(term);
    termSection.appendChild(termHeader);

    const termContent = document.createElement('div');
    termContent.className = 'term-content';

    for (const course in courseMenu[term]) {
      const courseCard = document.createElement('div');
      courseCard.className = 'course-card';

      const courseHeader = document.createElement('div');
      courseHeader.className = 'course-card-header';
      const courseQuizCount = courseMenu[term][course].length;
      courseHeader.innerHTML = `
        <h3>${course}</h3>
        <span class="course-count">${courseQuizCount} ${courseQuizCount === 1 ? 'quiz' : 'quizzes'}</span>
      `;
      courseCard.appendChild(courseHeader);

      const quizList = document.createElement('div');
      quizList.className = 'quiz-list';

      const courseQuizzes = courseMenu[term][course];

      // Pass 1: count how many quizzes share each "<Series> - <Item>" prefix
      const prefixCounts = {};
      courseQuizzes.forEach(quiz => {
        const parts = quiz.title.split(' - ');
        if (parts.length < 2) return;
        const prefix = parts[0];
        prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
      });

      // Pass 2: build render units in original order, merging same-prefix quizzes
      // (2+ siblings) into one series bucket regardless of position.
      const units = [];
      const seriesByPrefix = new Map();
      courseQuizzes.forEach(quiz => {
        const parts = quiz.title.split(' - ');
        const prefix = parts.length >= 2 ? parts[0] : null;
        const isSeries = prefix && prefixCounts[prefix] >= 2;

        if (isSeries) {
          let series = seriesByPrefix.get(prefix);
          if (!series) {
            series = { type: 'series', name: prefix, items: [] };
            seriesByPrefix.set(prefix, series);
            units.push(series);
          }
          series.items.push({ quiz, label: quiz.title.slice(prefix.length + 3) });
        } else {
          units.push({ type: 'standalone', quiz, label: quiz.title });
        }
      });

      const makeQuizRow = (quiz, label) => {
        const quizBtn = document.createElement('button');
        quizBtn.className = 'btn-quiz';
        const totalItems = quiz.data.questions ? quiz.data.questions.length : 0;
        quizBtn.innerHTML = `
          <span class="quiz-btn-title">${label}</span>
          <span class="quiz-btn-right">
            <span class="quiz-btn-meta">${totalItems}</span>
            <span class="quiz-btn-icon">→</span>
          </span>
        `;
        quizBtn.onclick = () => startQuizMode(term, course, quiz.data);
        return quizBtn;
      };

      const makeQuizChip = (quiz, label) => {
        const chip = document.createElement('button');
        chip.className = 'quiz-chip';
        const totalItems = quiz.data.questions ? quiz.data.questions.length : 0;
        chip.innerHTML = `
          <span class="quiz-chip-label">${label}</span>
          <span class="quiz-chip-count">${totalItems}</span>
        `;
        chip.onclick = () => startQuizMode(term, course, quiz.data);
        return chip;
      };

      units.forEach(unit => {
        if (unit.type === 'series') {
          const seriesEl = document.createElement('div');
          seriesEl.className = 'quiz-series';

          const seriesHeader = document.createElement('div');
          seriesHeader.className = 'quiz-series-header';
          seriesHeader.innerHTML = `
            <span>${unit.name}</span>
            <span class="quiz-series-count">${unit.items.length}</span>
          `;
          seriesEl.appendChild(seriesHeader);

          const chipRow = document.createElement('div');
          chipRow.className = 'quiz-series-chips';
          unit.items.forEach(({ quiz, label }) => {
            chipRow.appendChild(makeQuizChip(quiz, label));
          });
          seriesEl.appendChild(chipRow);
          quizList.appendChild(seriesEl);
        } else {
          quizList.appendChild(makeQuizRow(unit.quiz, unit.label));
        }
      });
      courseCard.appendChild(quizList);
      termContent.appendChild(courseCard);
    }
    termSection.appendChild(termContent);
    container.appendChild(termSection);
  }
  appRoot.appendChild(container);

  const footer = document.createElement('footer');
  footer.className = 'home-footer';
  footer.innerHTML = `Last updated: ${formatBuildDate(__BUILD_DATE__)}`;
  appRoot.appendChild(footer);
}

function formatBuildDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });
}

// --- 3b. Mode Selection (Quiz vs Review) ---
function openModeSelect(term, course, quizData) {
  hideSideNav();
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

  activeQuiz = JSON.parse(JSON.stringify(quizData));

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
      } else if (q.type === 'msq') {
        let arr = q.options.map((opt, i) => ({ text: opt, isCorrect: q.correctAnswer.includes(i) }));
        shuffleArray(arr);
        q.options = arr.map(a => a.text);
        q.correctAnswer = arr.reduce((acc, a, i) => { if (a.isCorrect) acc.push(i); return acc; }, []);
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
            <div class="dropdown-close-row">
              <button class="modal-close" onclick="toggleDropdown('quiz-dropdown')" aria-label="Close">✕</button>
            </div>
            <button class="dropdown-mode-switch" onclick="switchToReview()">Switch to Review Mode →</button>
            <div class="dropdown-divider"></div>
            
            <div class="dropdown-header" onclick="toggleCategory(this)">Quiz Options</div>
            <div class="dropdown-category-content">
              <label class="dropdown-item">
                <span class="dropdown-item-text">
                  <strong>Shuffle questions</strong>
                  <small>Randomizes order (Applies on Restart)</small>
                </span>
                ${renderSwitch("setQuizOption('shuffleQuestions', this.checked)", quizOptions.shuffleQuestions)}
              </label>
              <label class="dropdown-item">
                <span class="dropdown-item-text">
                  <strong>Shuffle choices</strong>
                  <small>Randomizes choices (Applies on Restart)</small>
                </span>
                ${renderSwitch("setQuizOption('shuffleChoices', this.checked)", quizOptions.shuffleChoices)}
              </label>
              <label class="dropdown-item">
                <span class="dropdown-item-text">
                  <strong>Hide feedback</strong>
                  <small>Never show the "Correct!" / "Incorrect" banner after answering</small>
                </span>
                ${renderSwitch("setQuizOption('hideFeedback', this.checked)", quizOptions.hideFeedback)}
              </label>
              <label class="dropdown-item">
                <span class="dropdown-item-text">
                  <strong>Hide explanation</strong>
                  <small>Never show the explanation text after answering</small>
                </span>
                ${renderSwitch("setQuizOption('hideExplanation', this.checked)", quizOptions.hideExplanation)}
              </label>
              <label class="dropdown-item">
                <span class="dropdown-item-text">
                  <strong>Skip feedback if explained</strong>
                  <small>Only hide the correct/incorrect banner on questions that already show an explanation</small>
                </span>
                ${renderSwitch("setQuizOption('hideFeedbackIfExplanation', this.checked)", quizOptions.hideFeedbackIfExplanation)}
              </label>
              <label class="dropdown-item">
                <span class="dropdown-item-text">
                  <strong>Disable navigation</strong>
                  <small>Must answer before moving forward</small>
                </span>
                ${renderSwitch("setQuizOption('noSkip', this.checked)", quizOptions.noSkip)}
              </label>
            </div>
            
            <div class="dropdown-divider"></div>
            <div class="dropdown-header" onclick="toggleCategory(this)">App Settings</div>
            <div class="dropdown-category-content">
              <label class="dropdown-item" style="flex-direction: column; align-items: flex-start; gap: 0.5rem;">
                <span class="dropdown-item-text">
                  <strong>UI Theme</strong>
                  <small>Switch app appearance</small>
                </span>
                <select onchange="setAppSetting('theme', this.value)" style="width: 100%; padding: 0.4rem; border: 1px solid var(--border); border-radius: 6px;">
                  <option value="default" ${appSettings.theme === 'default' ? 'selected' : ''}>${THEME_MODE_ICONS.default} Misty Blue</option>
                  <option value="canvas" ${appSettings.theme === 'canvas' ? 'selected' : ''}>${THEME_MODE_ICONS.canvas} Canvas</option>
                  <option value="dark-purple" ${appSettings.theme === 'dark-purple' ? 'selected' : ''}>${THEME_MODE_ICONS['dark-purple']} Dark Purple</option>
                </select>
              </label>
              <label class="dropdown-item" style="flex-direction: column; align-items: flex-start; gap: 0.5rem;">
                <span class="dropdown-item-text">
                  <strong>Navigation Position</strong>
                  <small>Where to place Prev/Next</small>
                </span>
                <select onchange="setAppSetting('navLocation', this.value)" style="width: 100%; padding: 0.4rem; border: 1px solid var(--border); border-radius: 6px;">
                  <option value="up" ${appSettings.navLocation === 'up' ? 'selected' : ''}>Top</option>
                  <option value="down" ${appSettings.navLocation === 'down' ? 'selected' : ''}>Bottom</option>
                  <option value="sides" ${appSettings.navLocation === 'sides' ? 'selected' : ''}>Sides</option>
                  <option value="center" ${appSettings.navLocation === 'center' ? 'selected' : ''}>Centered</option>
                  <option value="both" ${appSettings.navLocation === 'both' ? 'selected' : ''}>Top and Bottom</option>
                  <option value="all" ${appSettings.navLocation === 'all' ? 'selected' : ''}>All</option>
                </select>
              </label>
              <label class="dropdown-item">
                <span class="dropdown-item-text">
                  <strong>Disable animations</strong>
                  <small>Turn off all transitions and fades</small>
                </span>
                ${renderSwitch("setAppSetting('disableAnimations', this.checked)", appSettings.disableAnimations)}
              </label>
              <label class="dropdown-item">
                <span class="dropdown-item-text">
                  <strong>Compact mode</strong>
                  <small>Tighter spacing, less scrolling</small>
                </span>
                ${renderSwitch("setAppSetting('compactMode', this.checked)", appSettings.compactMode)}
              </label>
            </div>
          </div>
        </div>
      </div>
    </header>
    <nav id="quiz-nav-top" class="nav-row"></nav>
    <main id="quiz-container"></main>
    <footer id="quiz-nav-bottom" class="nav-row"></footer>
    <div class="mobile-quiz-actions">
      <button class="btn-restart" onclick="restartQuiz()">Restart</button>
      <button class="btn-exit" onclick="renderMenu()">Exit</button>
    </div>
  `;
}

function renderQuestion() {
  const container = document.getElementById('quiz-container');

  const lbl = document.getElementById('progress-label');
  const fill = document.getElementById('progress-bar-fill');
  if (lbl) lbl.innerText = `${currentIndex + 1}/${activeQuiz.questions.length}`;
  if (fill) fill.style.width = `${((currentIndex + 1) / activeQuiz.questions.length) * 100}%`;

  const question = activeQuiz.questions[currentIndex];
  const savedState = userAnswers[question.id] || { value: null, submitted: false };
  const isLocked = savedState.submitted;

  const typeMap = {
    'mc': 'Multiple Choice', 'tf': 'True / False', 'msq': 'Multiple Select',
    'fitb': 'Fill in the Blank', 'matching': 'Dropdown Matching', 'drag-drop': 'Drag & Drop'
  };

  let html = `
    <div class="question-card">
      <div class="q-meta">
        <div class="q-meta-left">
          <span class="q-num-badge">${currentIndex + 1}</span>
          <span class="q-type-badge ${question.type}">${typeMap[question.type] || 'Question'}</span>
        </div>
        <span class="q-points ${question.flagged ? 'q-points--flagged' : ''}">${question.flagged ? 'Not Scored' : (question.points || 1) + ' pts'}</span>
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
                   onchange="saveAnswer(${question.id}, ${idx}); document.getElementById('submit-btn-${question.id}').disabled = false;">
            <span>${opt}</span>
          </label>
        `;
      });
      if (!isLocked) html += `<button id="submit-btn-${question.id}" class="btn-check" style="margin-top:1rem;" onclick="checkAnswer(${question.id})" ${savedState.value === null ? 'disabled' : ''}>Submit</button>`;
      break;

    case 'msq': {
      const savedSet = savedState.value || [];
      question.options.forEach((opt, idx) => {
        const isChecked = savedSet.includes(idx) ? 'checked' : '';
        let statusClass = '';
        if (isLocked) {
          if (question.correctAnswer.includes(idx)) statusClass = 'reveal-correct';
          else if (savedSet.includes(idx)) statusClass = 'reveal-wrong';
        }
        html += `
          <label class="option-label ${statusClass} ${isLocked ? 'locked' : ''}">
            <input type="checkbox" name="q${question.id}" value="${idx}" ${isChecked}
                   ${isLocked ? 'disabled' : ''}
                   onchange="toggleMSQAnswer(${question.id}, ${idx}, this.checked)">
            <span>${opt}</span>
          </label>
        `;
      });
      if (!isLocked) html += `<button class="btn-check" style="margin-top:1rem;" onclick="checkAnswer(${question.id})">Submit</button>`;
      break;
    }

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
          ${!isLocked ? `<button class="btn-check" onclick="checkAnswer(${question.id})">Submit</button>` : ''}
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
      if (!isLocked) html += `<button class="btn-check" style="margin-top:1rem;" onclick="checkAnswer(${question.id})">Submit</button>`;
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
      if (!isLocked) html += `<button class="btn-check" style="margin-top:1rem;" onclick="checkAnswer(${question.id})">Submit</button>`;
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
    } else if (question.type === 'msq') {
      const sel = (savedState.value || []).slice().sort();
      const correct = question.correctAnswer.slice().sort();
      isPerfect = sel.length === correct.length && sel.every((v, i) => v === correct[i]);
      expectedText = question.correctAnswer.map(i => question.options[i]).join(', ');
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

    if (question.flagged) {
      html += `
        <div class="feedback-banner warning">
          <strong>⚠ Flagged Question — Not Scored</strong><br>
          The source material flags this question as broken (no listed choice matches the correct output). It isn't counted toward your score.
        </div>
      `;
    } else if (showFeedback) {
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

  renderNavRow(isFirst, isLast, nextBlocked, true);
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
            <div class="dropdown-close-row">
              <button class="modal-close" onclick="toggleDropdown('review-dropdown')" aria-label="Close">✕</button>
            </div>
            <button class="dropdown-mode-switch" onclick="switchToQuiz()">Switch to Quiz Mode →</button>
            <div class="dropdown-divider"></div>
            
            <div class="dropdown-header" onclick="toggleCategory(this)">Review Options</div>
            <div class="dropdown-category-content">
              <label class="dropdown-item">
                <span class="dropdown-item-text">
                  <strong>List View</strong>
                  <small>Show all questions on one page</small>
                </span>
                ${renderSwitch("setReviewOption('listView', this.checked)", reviewOptions.listView)}
              </label>
              <label class="dropdown-item">
                <span class="dropdown-item-text">
                  <strong>Show all choices</strong>
                  <small>Display all options, not just the answer</small>
                </span>
                ${renderSwitch("setReviewOption('showAllChoices', this.checked)", reviewOptions.showAllChoices, 'opt-allchoices')}
              </label>
              <label class="dropdown-item">
                <span class="dropdown-item-text">
                  <strong>Hide explanation</strong>
                  <small>Don't show the explanation text</small>
                </span>
                ${renderSwitch("setReviewOption('hideExplanation', this.checked)", reviewOptions.hideExplanation)}
              </label>
            </div>
            
            <div class="dropdown-divider"></div>
            <div class="dropdown-header" onclick="toggleCategory(this)">App Settings</div>
            <div class="dropdown-category-content">
              <label class="dropdown-item" style="flex-direction: column; align-items: flex-start; gap: 0.5rem;">
                <span class="dropdown-item-text">
                  <strong>UI Theme</strong>
                  <small>Switch app appearance</small>
                </span>
                <select onchange="setAppSetting('theme', this.value)" style="width: 100%; padding: 0.4rem; border: 1px solid var(--border); border-radius: 6px;">
                  <option value="default" ${appSettings.theme === 'default' ? 'selected' : ''}>${THEME_MODE_ICONS.default} Misty Blue</option>
                  <option value="canvas" ${appSettings.theme === 'canvas' ? 'selected' : ''}>${THEME_MODE_ICONS.canvas} Canvas</option>
                  <option value="dark-purple" ${appSettings.theme === 'dark-purple' ? 'selected' : ''}>${THEME_MODE_ICONS['dark-purple']} Dark Purple</option>
                </select>
              </label>
              <label class="dropdown-item" style="flex-direction: column; align-items: flex-start; gap: 0.5rem;">
                <span class="dropdown-item-text">
                  <strong>Navigation Position</strong>
                  <small>Where to place Prev/Next</small>
                </span>
                <select onchange="setAppSetting('navLocation', this.value)" style="width: 100%; padding: 0.4rem; border: 1px solid var(--border); border-radius: 6px;">
                  <option value="up" ${appSettings.navLocation === 'up' ? 'selected' : ''}>Top</option>
                  <option value="down" ${appSettings.navLocation === 'down' ? 'selected' : ''}>Bottom</option>
                  <option value="sides" ${appSettings.navLocation === 'sides' ? 'selected' : ''}>Sides</option>
                  <option value="center" ${appSettings.navLocation === 'center' ? 'selected' : ''}>Centered</option>
                  <option value="both" ${appSettings.navLocation === 'both' ? 'selected' : ''}>Top and Bottom</option>
                  <option value="all" ${appSettings.navLocation === 'all' ? 'selected' : ''}>All</option>
                </select>
              </label>
              <label class="dropdown-item">
                <span class="dropdown-item-text">
                  <strong>Disable animations</strong>
                  <small>Turn off all transitions and fades</small>
                </span>
                ${renderSwitch("setAppSetting('disableAnimations', this.checked)", appSettings.disableAnimations)}
              </label>
              <label class="dropdown-item">
                <span class="dropdown-item-text">
                  <strong>Compact mode</strong>
                  <small>Tighter spacing, less scrolling</small>
                </span>
                ${renderSwitch("setAppSetting('compactMode', this.checked)", appSettings.compactMode)}
              </label>
            </div>
          </div>
        </div>
      </div>
    </header>
    <nav id="quiz-nav-top" class="nav-row"></nav>
    <main id="quiz-container"></main>
    <footer id="quiz-nav-bottom" class="nav-row"></footer>
    <div class="mobile-quiz-actions">
      <button class="btn-restart" onclick="restartQuiz()">Restart</button>
      <button class="btn-exit" onclick="renderMenu()">Exit</button>
    </div>
  `;
}

function generateReviewCardHTML(question, index) {
  const typeMap = {
    'mc': 'Multiple Choice', 'tf': 'True / False', 'msq': 'Multiple Select',
    'fitb': 'Fill in the Blank', 'matching': 'Dropdown Matching', 'drag-drop': 'Drag & Drop'
  };

  let html = `
    <div class="question-card question-card--review ${reviewOptions.listView ? 'question-card--list' : ''}">
      <div class="q-meta">
        <div class="q-meta-left">
          <span class="q-num-badge">${index + 1}</span>
          <span class="q-type-badge ${question.type}">${typeMap[question.type] || 'Question'}</span>
        </div>
        <span class="q-points ${question.flagged ? 'q-points--flagged' : ''}">${question.flagged ? 'Not Scored' : (question.points || 1) + ' pts'}</span>
      </div>
      ${question.context ? `<div class="q-context"><div class="q-context-body">${question.context}</div></div>` : ''}
      <div class="q-text">${question.text}</div>
      <div class="options-list">
  `;

  if (question.flagged) {
    if (question.options) {
      question.options.forEach(opt => {
        html += `<div class="option-label locked"><span>${opt}</span></div>`;
      });
    }
    html += `
      <div class="feedback-banner warning" style="margin-top:1rem;">
        <strong>⚠ Flagged Question — Not Scored</strong><br>
        The source material flags this question as broken (no listed choice matches the correct output).
      </div>
    `;
  } else if (question.type === 'mc' || question.type === 'tf') {
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
  } else if (question.type === 'msq') {
    if (reviewOptions.showAllChoices) {
      question.options.forEach((opt, idx) => {
        const isCorrect = question.correctAnswer.includes(idx);
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
          <span class="review-answer-label">Correct Answers</span>
          <div class="review-answer-value">${question.correctAnswer.map(i => question.options[i]).join(', ')}</div>
        </div>
      `;
    }
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

  html += `</div>`;
  
  if (question.explanation && !reviewOptions.hideExplanation) {
    html += `
      <div class="q-explanation">
        <span class="q-explanation-label">Explanation</span>
        <div class="q-explanation-text">${question.explanation}</div>
      </div>
    `;
  }
  
  html += `</div>`;
  return html;
}

function renderReviewQuestion() {
  const container = document.getElementById('quiz-container');
  const lbl = document.getElementById('progress-label');
  const fill = document.getElementById('progress-bar-fill');

  if (reviewOptions.listView) {
    // Show total items instead of "All Questions"
    if (lbl) lbl.innerText = `${activeQuiz.questions.length} Items`;
    if (fill) fill.style.width = `100%`;

    let allHtml = '';
    activeQuiz.questions.forEach((q, idx) => {
      allHtml += generateReviewCardHTML(q, idx);
    });
    container.innerHTML = allHtml;
    
    renderNavRow(true, true, false, false);
  } else {
    if (lbl) lbl.innerText = `${currentIndex + 1}/${activeQuiz.questions.length}`;
    if (fill) fill.style.width = `${((currentIndex + 1) / activeQuiz.questions.length) * 100}%`;

    container.innerHTML = generateReviewCardHTML(activeQuiz.questions[currentIndex], currentIndex);

    const isFirst = currentIndex === 0;
    const isLast = currentIndex === activeQuiz.questions.length - 1;
    renderNavRow(isFirst, isLast, false, false);
  }
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

window.toggleMSQAnswer = (qId, idx, checked) => {
  if (!userAnswers[qId]) userAnswers[qId] = { value: [], submitted: false };
  if (!userAnswers[qId].value) userAnswers[qId].value = [];
  const arr = userAnswers[qId].value;
  if (checked) {
    if (!arr.includes(idx)) arr.push(idx);
  } else {
    userAnswers[qId].value = arr.filter(i => i !== idx);
  }
};

function navigateWithAnimation(fn) {
  if (appSettings.disableAnimations || (activeMode === 'review' && reviewOptions.listView)) { fn(); return; }
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
    window.scrollTo(0, 0); 
  });
};

window.prevQ = () => {
  navigateWithAnimation(() => {
    currentIndex--;
    activeMode === 'review' ? renderReviewQuestion() : renderQuestion();
    window.scrollTo(0, 0); 
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
    void menu.offsetHeight; // force a reflow so the opacity/transform transition runs
    menu.classList.add('dropdown-menu--open');
  }
};

// New function for toggling categories
window.toggleCategory = (element) => {
  element.classList.toggle('collapsed');
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
  } else if (key === 'compactMode') {
    document.body.classList.toggle('compact-mode', value);
    positionNearNav();
  } else if (key === 'navLocation') {
    if (activeMode === 'quiz' && activeQuiz) renderQuestion();
    else if (activeMode === 'review' && activeQuiz) renderReviewQuestion();
  } else if (key === 'theme') {
    // Strip all existing theme classes first
    document.body.classList.remove('theme-canvas', 'theme-dark-purple');
    // Apply the new theme if it's not the default Misty Blue
    if (value !== 'default') {
      document.body.classList.add(`theme-${value}`);
    }
    positionNearNav();
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
  if (cb) cb.checked = reviewOptions.showAllChoices;
};

window.toggleTerm = (term) => {
  collapsedTerms[term] = !collapsedTerms[term];
  localStorage.setItem('quizApp_collapsedTerms', JSON.stringify(collapsedTerms));
  renderMenu();
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
window.closeModal = () => {
  document.querySelector('.modal-overlay')?.remove();
};

window.confirmSubmitQuiz = () => {
  const unanswered = activeQuiz.questions.filter(
    q => !q.flagged && !userAnswers[q.id]?.submitted
  ).length;
  const message = unanswered > 0
    ? `You have ${unanswered} unanswered question${unanswered === 1 ? '' : 's'}. Are you sure you want to submit?`
    : `Are you sure you want to submit your quiz?`;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
  overlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>Submit Quiz?</h3>
        <button class="modal-close" onclick="closeModal()" aria-label="Close">✕</button>
      </div>
      <p>${message}</p>
      <div class="modal-actions">
        <button class="btn-prev" onclick="closeModal()">Cancel</button>
        <button class="btn-next" onclick="closeModal(); submitQuiz();">Submit</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
};

window.submitQuiz = () => {
  hideSideNav();
  let score = 0;
  let totalPossible = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  let flaggedCount = 0;

  activeQuiz.questions.forEach(q => {
    if (q.flagged) { flaggedCount++; return; }
    const pts = q.points || 1;
    totalPossible += pts;
    const userAnswer = userAnswers[q.id]?.value ?? null;
    const wasAnswered = userAnswer !== null && userAnswer !== undefined &&
      !(Array.isArray(userAnswer) && userAnswer.length === 0) &&
      !(typeof userAnswer === 'object' && !Array.isArray(userAnswer) && Object.keys(userAnswer).length === 0);

    let earned = 0;
    if (q.type === 'mc' || q.type === 'tf') {
      if (userAnswer === q.correctAnswer) earned = pts;
    } else if (q.type === 'fitb') {
      if (userAnswer && userAnswer.trim().toLowerCase() === q.correctAnswer.toLowerCase()) earned = pts;
    } else if (q.type === 'msq') {
      const sel = (userAnswer || []).slice().sort();
      const correct = q.correctAnswer.slice().sort();
      if (sel.length === correct.length && sel.every((v, i) => v === correct[i])) earned = pts;
    } else if (q.type === 'matching' || q.type === 'drag-drop') {
      const ppp = pts / q.pairs.length;
      q.pairs.forEach(pair => { if (userAnswer && userAnswer[pair.term] === pair.match) earned += ppp; });
    }

    score += earned;
    if (!wasAnswered) unansweredCount++;
    else if (earned >= pts - 0.001) correctCount++;
    else wrongCount++;
  });

  const percentage = Math.round((score / totalPossible) * 100);
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference * (1 - percentage / 100);
  const ringColor = percentage >= 80 ? 'var(--correct)' : percentage >= 50 ? 'var(--accent)' : '#d94f4f';

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
    <main class="question-card result-card">
      <div class="result-ring-wrap">
        <svg class="result-ring" viewBox="0 0 120 120">
          <circle class="result-ring-track" cx="60" cy="60" r="54"></circle>
          <circle class="result-ring-fill" cx="60" cy="60" r="54" style="stroke:${ringColor}; stroke-dasharray:${circumference}; stroke-dashoffset:${dashOffset};"></circle>
        </svg>
        <div class="result-ring-label">${percentage}%</div>
      </div>
      <h3>You scored ${Math.round(score * 100) / 100} out of ${totalPossible} points</h3>
      <div class="result-breakdown">
        <div class="result-stat result-stat--correct"><strong>${correctCount}</strong><span>Correct</span></div>
        <div class="result-stat result-stat--wrong"><strong>${wrongCount}</strong><span>Incorrect</span></div>
        <div class="result-stat result-stat--unanswered"><strong>${unansweredCount}</strong><span>Unanswered</span></div>
        ${flaggedCount > 0 ? `<div class="result-stat result-stat--flagged"><strong>${flaggedCount}</strong><span>Not Scored</span></div>` : ''}
      </div>
      <div class="result-actions">
        <button class="btn-next" onclick="switchToReview()">Review Answers</button>
        <button class="btn-prev" onclick="renderMenu()">Return to Main Menu</button>
      </div>
    </main>
  `;
};

window.updateScore = () => {
  let score = 0;
  activeQuiz.questions.forEach(q => {
    if (q.flagged) return;
    const data = userAnswers[q.id];
    if (data?.submitted) {
      if ((q.type === 'mc' || q.type === 'tf') && data.value === q.correctAnswer) score += (q.points || 1);
      else if (q.type === 'fitb' && data.value?.trim().toLowerCase() === q.correctAnswer.toLowerCase()) score += (q.points || 1);
      else if (q.type === 'msq' && data.value) {
        const sel = data.value.slice().sort();
        const correct = q.correctAnswer.slice().sort();
        if (sel.length === correct.length && sel.every((v, i) => v === correct[i])) score += (q.points || 1);
      }
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