// Set default dates on load
window.addEventListener('load', function() {
    const today = new Date();
    const todayStr = formatDateInput(today);

    document.getElementById('from-date').value = todayStr;
    document.getElementById('base-date').value = todayStr;

    // Set "to" date to 30 days from now by default
    const future = new Date(today);
    future.setDate(future.getDate() + 30);
    document.getElementById('to-date').value = formatDateInput(future);

    // Set until/since dates
    const nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    document.getElementById('until-date').value = formatDateInput(nextYear);

    const pastDate = new Date(today);
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    document.getElementById('since-date').value = formatDateInput(pastDate);

    updateTodayCard();
    renderEventCountdowns();
});

// Switch tabs
function switchTab(tabId) {
    document.querySelectorAll('.calc-card').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.remove('hidden');
    const idx = { 'between': 0, 'add-subtract': 1, 'days-until': 2, 'days-since': 3 };
    document.querySelectorAll('.tab-btn')[idx[tabId]].classList.add('active');
}

// ---- Tab 1: Days Between ----
function calcBetween() {
    clearErrors();
    const from = new Date(document.getElementById('from-date').value);
    const to = new Date(document.getElementById('to-date').value);

    if (!document.getElementById('from-date').value || !document.getElementById('to-date').value) {
        showError('err-between', 'Please select both dates');
        return;
    }

    const fromAdj = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    const toAdj = new Date(to.getFullYear(), to.getMonth(), to.getDate());

    const diffMs = toAdj - fromAdj;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const absDays = Math.abs(diffDays);
    const isNeg = diffDays < 0;

    const { years, months, days } = dateDiff(isNeg ? toAdj : fromAdj, isNeg ? fromAdj : toAdj);
    const weeks = Math.floor(absDays / 7);
    const remDays = absDays % 7;

    document.getElementById('res-between').innerHTML = `
        <div class="result-main">
            <div class="result-label">${formatDateDisplay(isNeg ? to : from)} → ${formatDateDisplay(isNeg ? from : to)}</div>
            <div class="result-value">${absDays.toLocaleString()}</div>
            <div class="result-unit">day${absDays !== 1 ? 's' : ''} ${isNeg ? '(reversed)' : ''}</div>
        </div>
        <div class="result-details">
            <div class="result-row"><span>Years, Months, Days</span><span>${years}y ${months}m ${days}d</span></div>
            <div class="result-row"><span>Total Weeks</span><span>${weeks} weeks${remDays ? ' + ' + remDays + ' days' : ''}</span></div>
            <div class="result-row"><span>Total Days</span><span>${absDays.toLocaleString()}</span></div>
            <div class="result-row"><span>Total Hours</span><span>${(absDays * 24).toLocaleString()}</span></div>
            <div class="result-row"><span>Start Date</span><span>${formatDateDisplay(from)}</span></div>
            <div class="result-row"><span>End Date</span><span>${formatDateDisplay(to)}</span></div>
        </div>
    `;
}

// ---- Tab 2: Add / Subtract ----
function calcAddSubtract() {
    clearErrors();
    const baseVal = document.getElementById('base-date').value;
    if (!baseVal) {
        showError('err-as', 'Please select a starting date');
        return;
    }

    const base = new Date(baseVal + 'T00:00:00');
    const op = document.getElementById('operation').value;
    const years = parseInt(document.getElementById('add-years').value) || 0;
    const months = parseInt(document.getElementById('add-months').value) || 0;
    const weeks = parseInt(document.getElementById('add-weeks').value) || 0;
    const days = parseInt(document.getElementById('add-days').value) || 0;

    if (years === 0 && months === 0 && weeks === 0 && days === 0) {
        showError('err-as', 'Please enter at least one value to add or subtract');
        return;
    }

    const result = new Date(base);
    const sign = op === 'add' ? 1 : -1;

    result.setFullYear(result.getFullYear() + sign * years);
    result.setMonth(result.getMonth() + sign * months);
    result.setDate(result.getDate() + sign * (weeks * 7 + days));

    const totalDays = Math.abs(Math.round((result - base) / (1000 * 60 * 60 * 24)));
    const opWord = op === 'add' ? 'Adding' : 'Subtracting';
    const arrow = op === 'add' ? '→' : '←';

    document.getElementById('res-add-subtract').innerHTML = `
        <div class="result-main">
            <div class="result-label">${formatDateDisplay(base)} ${arrow} Result</div>
            <div class="result-value" style="font-size:32px; padding: 10px 0">${formatDateDisplay(result)}</div>
            <div class="result-unit">${getDayName(result)}</div>
        </div>
        <div class="result-details">
            <div class="result-row"><span>Starting Date</span><span>${formatDateDisplay(base)}</span></div>
            <div class="result-row"><span>Operation</span><span>${opWord} ${years > 0 ? years + 'y ' : ''}${months > 0 ? months + 'm ' : ''}${weeks > 0 ? weeks + 'w ' : ''}${days > 0 ? days + 'd' : ''}</span></div>
            <div class="result-row"><span>Result Date</span><span>${formatDateDisplay(result)}</span></div>
            <div class="result-row"><span>Day of Week</span><span>${getDayName(result)}</span></div>
            <div class="result-row"><span>Total Days ${op === 'add' ? 'Added' : 'Subtracted'}</span><span>${totalDays.toLocaleString()}</span></div>
        </div>
    `;
}

// ---- Tab 3: Days Until ----
function calcUntil() {
    clearErrors();
    const untilVal = document.getElementById('until-date').value;
    if (!untilVal) {
        showError('err-until', 'Please select a target date');
        return;
    }

    const target = new Date(untilVal + 'T00:00:00');
    const today = new Date();
    const todayAdj = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const targetAdj = new Date(target.getFullYear(), target.getMonth(), target.getDate());

    const diffDays = Math.round((targetAdj - todayAdj) / (1000 * 60 * 60 * 24));
    const name = document.getElementById('until-name').value || 'your event';

    if (diffDays < 0) {
        showError('err-until', 'That date is in the past! Use "Days Since" tab instead.');
        return;
    }

    if (diffDays === 0) {
        document.getElementById('res-until').innerHTML = `
            <div class="result-main" style="background: linear-gradient(135deg, #f093fb, #f5576c)">
                <div class="result-label">🎉 ${name}</div>
                <div class="result-value">TODAY!</div>
                <div class="result-unit">${formatDateDisplay(target)}</div>
            </div>
        `;
        return;
    }

    const weeks = Math.floor(diffDays / 7);
    const remDays = diffDays % 7;
    const { years, months, days } = dateDiff(todayAdj, targetAdj);

    document.getElementById('res-until').innerHTML = `
        <div class="result-main" style="background: linear-gradient(135deg, #4facfe, #00f2fe)">
            <div class="result-label">⏳ Days until ${name}</div>
            <div class="result-value">${diffDays.toLocaleString()}</div>
            <div class="result-unit">day${diffDays !== 1 ? 's' : ''} to go</div>
        </div>
        <div class="result-details">
            <div class="result-row"><span>Event Date</span><span>${formatDateDisplay(target)} (${getDayName(target)})</span></div>
            <div class="result-row"><span>Years, Months, Days</span><span>${years}y ${months}m ${days}d</span></div>
            <div class="result-row"><span>Weeks</span><span>${weeks} weeks${remDays ? ' + ' + remDays + ' days' : ''}</span></div>
            <div class="result-row"><span>Total Days</span><span>${diffDays.toLocaleString()}</span></div>
        </div>
    `;
}

// ---- Tab 4: Days Since ----
function calcSince() {
    clearErrors();
    const sinceVal = document.getElementById('since-date').value;
    if (!sinceVal) {
        showError('err-since', 'Please select a past date');
        return;
    }

    const past = new Date(sinceVal + 'T00:00:00');
    const today = new Date();
    const todayAdj = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const pastAdj = new Date(past.getFullYear(), past.getMonth(), past.getDate());

    const diffDays = Math.round((todayAdj - pastAdj) / (1000 * 60 * 60 * 24));
    const name = document.getElementById('since-name').value || 'that date';

    if (diffDays < 0) {
        showError('err-since', 'That date is in the future! Use "Days Until" tab instead.');
        return;
    }

    const weeks = Math.floor(diffDays / 7);
    const remDays = diffDays % 7;
    const { years, months, days } = dateDiff(pastAdj, todayAdj);

    document.getElementById('res-since').innerHTML = `
        <div class="result-main" style="background: linear-gradient(135deg, #43e97b, #38f9d7)">
            <div class="result-label">📆 Days since ${name}</div>
            <div class="result-value">${diffDays.toLocaleString()}</div>
            <div class="result-unit">day${diffDays !== 1 ? 's' : ''} ago</div>
        </div>
        <div class="result-details">
            <div class="result-row"><span>Past Date</span><span>${formatDateDisplay(past)} (${getDayName(past)})</span></div>
            <div class="result-row"><span>Years, Months, Days</span><span>${years}y ${months}m ${days}d</span></div>
            <div class="result-row"><span>Weeks</span><span>${weeks} weeks${remDays ? ' + ' + remDays + ' days' : ''}</span></div>
            <div class="result-row"><span>Total Days</span><span>${diffDays.toLocaleString()}</span></div>
            <div class="result-row"><span>Total Hours</span><span>${(diffDays * 24).toLocaleString()}</span></div>
        </div>
    `;
}

// ---- Today Card ----
function updateTodayCard() {
    const today = new Date();
    document.getElementById('today-display').textContent = formatDateDisplay(today);
    const dayOfYear = getDayOfYear(today);
    const daysLeft = isLeapYear(today.getFullYear()) ? 366 - dayOfYear : 365 - dayOfYear;
    document.getElementById('today-details').innerHTML = `
        ${getDayName(today)}<br>
        Day ${dayOfYear} of ${today.getFullYear()}<br>
        ${daysLeft} days left in ${today.getFullYear()}
    `;
}

// ---- Event Countdowns ----
function renderEventCountdowns() {
    const today = new Date();
    const year = today.getFullYear();

    const events = [
        { name: '🎄 Christmas', date: new Date(year, 11, 25) },
        { name: '🎆 New Year', date: new Date(year + 1, 0, 1) },
        { name: '💝 Valentine\'s Day', date: new Date(year + (today > new Date(year, 1, 14) ? 1 : 0), 1, 14) },
        { name: '🎃 Halloween', date: new Date(year + (today > new Date(year, 9, 31) ? 1 : 0), 9, 31) },
        { name: '🦃 Thanksgiving', date: getNthWeekday(year + (today > getNthWeekday(year, 10, 4, 4) ? 1 : 0), 10, 4, 4) },
        { name: '🌸 Easter', date: getEaster(year + (today > getEaster(year) ? 1 : 0)) },
    ];

    const list = document.getElementById('event-list');
    list.innerHTML = '';

    events.forEach(ev => {
        const todayAdj = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const evAdj = new Date(ev.date.getFullYear(), ev.date.getMonth(), ev.date.getDate());
        const days = Math.round((evAdj - todayAdj) / (1000 * 60 * 60 * 24));
        if (days < 0) return;

        const item = document.createElement('div');
        item.className = 'event-item';
        item.innerHTML = `
            <span class="event-name">${ev.name}</span>
            <span class="event-days">${days === 0 ? 'TODAY!' : days + ' days'}</span>
        `;
        item.onclick = () => {
            switchTab('days-until');
            document.getElementById('until-date').value = formatDateInput(ev.date);
            document.getElementById('until-name').value = ev.name.replace(/^\S+\s/, '');
            calcUntil();
        };
        list.appendChild(item);
    });
}

// ---- Helpers ----
function dateDiff(start, end) {
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
        months--;
        const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
        days += prevMonth.getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }
    return { years, months, days };
}

function formatDateInput(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function formatDateDisplay(date) {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getDayName(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    return Math.floor((date - start) / (1000 * 60 * 60 * 24));
}

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getNthWeekday(year, month, weekday, n) {
    const first = new Date(year, month, 1);
    const offset = (weekday - first.getDay() + 7) % 7;
    return new Date(year, month, 1 + offset + (n - 1) * 7);
}

function getEaster(year) {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
}

function showError(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.classList.add('show');
}

function clearErrors() {
    document.querySelectorAll('.error-msg').forEach(e => e.classList.remove('show'));
    document.querySelectorAll('.result-box').forEach(r => r.innerHTML = '');
}
