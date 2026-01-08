// Initial State
let state = {
    count: 0,
    corruptionLVL: 0,
    frozenDC: 4,
    currentTheme: 'light',
    currentCharges: 3,
    conModifier: 0,
    hasFailedSave: false
};

// Load Data
function loadData() {
    const saved = localStorage.getItem('useTrackerData');
    if (saved) {
        state = { ...state, ...JSON.parse(saved) };
    }
    document.getElementById('conModMain').value = state.conModifier;
    const themeRadio = document.querySelector(`input[name="theme"][value="${state.currentTheme}"]`);
    if (themeRadio) themeRadio.checked = true;
    
    applyTheme(state.currentTheme);
    updateUI();
}

function saveData() {
    localStorage.setItem('useTrackerData', JSON.stringify(state));
}

// UI Updates
function updateUI() {
    document.getElementById('countDisplay').innerText = state.count;
    document.getElementById('lvlDisplay').innerText = state.corruptionLVL;

    // DC Scaling
    const currentLogicDC = Math.floor(state.count / 4);
    if (state.corruptionLVL < 5) {
        document.getElementById('dcDisplay').innerText = currentLogicDC;
        state.frozenDC = currentLogicDC;
    } else {
        document.getElementById('dcDisplay').innerText = state.frozenDC;
    }

    // Visibility
    const isLevel5 = state.corruptionLVL >= 5;
    const showDC = (state.hasFailedSave || state.count >= 5) && !isLevel5;
    toggleVisibility('dcContainer', showDC);
    toggleVisibility('lvlContainer', state.corruptionLVL > 0);
    toggleVisibility('effectsBtn', state.corruptionLVL > 0);

    // Charges
    const maxCharges = 3 + ((state.corruptionLVL >= 4 && state.conModifier>0) ? parseInt(state.conModifier) : 0);
    if (state.currentCharges > maxCharges) state.currentCharges = maxCharges;
    document.getElementById('chargesDisplay').innerText = `(${state.currentCharges}/${maxCharges})`;
    document.getElementById('useBtn').disabled = state.currentCharges <= 0;

    updateEffectsList();
}

function toggleVisibility(id, show) {
    document.getElementById(id).classList.toggle('hidden', !show);
}

function updateEffectsList() {
    let html = '';
    const lvl = state.corruptionLVL;

    if (lvl >= 5) {
        html = `<b>MAX CORRUPTION</b><br><br><b>POSITIVE EFFECTS</b><br>• Add 1 to AC<br>• You add 1d4 damage to all weapon attacks (including unarmed)<br>• You gain two d10 Hit Dice that may only be used to heal with this item.<br>• This item increases its number of daily uses by Your Con bonus.<br>• You may now use this item as a Reaction.<br><br><b>NEGATIVE EFFECTS</b><br>• You must eat at least <b>11</b> meals each day to avoid starvation<br>• You suffer Disadvantage on Charisma-based checks (except Intimidate) until you've eaten at least 6 meals worth of food.<br>• You no longer regain hit dice on a long rest if you are at risk of starvation.<br>• You gain vulnerability to fire damage.`;
    } else if (lvl >= 4) {
        html = `<b>POSITIVE EFFECTS</b><br>• Add 1 to AC<br>• You add 1d4 damage to all weapon attacks (including unarmed)<br>• You gain two d10 Hit Dice that may only be used to heal with this item.<br>• This item increases its number of daily uses by Your Con bonus.<br><br><b>NEGATIVE EFFECTS</b><br>• You must eat at least <b>10</b> meals each day to avoid starvation<br>• You suffer Disadvantage on Charisma-based checks (except Intimidate) until you've eaten at least 6 meals worth of food.<br>• You no longer regain hit dice on a long rest if you are at risk of starvation.`;
    } else if (lvl >= 3) {
        html = `<b>POSITIVE EFFECTS</b><br>• Add 1 to AC<br>• You add 1d4 damage to all weapon attacks (including unarmed)<br>• You gain two d10 Hit Dice that may only be used to heal with this item.<br><br><b>NEGATIVE EFFECTS</b><br>• You must eat at least <b>9</b> meals each day to avoid starvation<br>• You suffer Disadvantage on Charisma-based checks (except Intimidate) until you've eaten at least 6 meals worth of food.`;
    } else if (lvl >= 2) {
        html = `<b>POSITIVE EFFECTS</b><br>• Add 1 to AC<br>• You add 1d4 damage to all weapon attacks (including unarmed)<br><br><b>NEGATIVE EFFECTS</b><br>• You must eat at least <b>8</b> meals each day to avoid starvation`;
    } else if (lvl >= 1) {
        html = `<b>POSITIVE EFFECTS</b><br>• Add 1 to AC<br><br><b>NEGATIVE EFFECTS</b><br>• You must eat at least <b>7</b> meals each day to avoid starvation`;
    } else {
        html = 'No effects';
    }

    document.getElementById('effectsList').innerHTML = html;
}

// Logic
document.getElementById('useBtn').onclick = () => {
    if (state.currentCharges > 0) {
        state.currentCharges--;
        state.count++;
        updateUI();
        saveData();
        if (state.corruptionLVL < 5 && state.count > 0 && state.count % 5 === 0) {
            showSavePopup();
        }
    }
};

document.getElementById('restBtn').onclick = () => {
    const max = 3 + (state.corruptionLVL >= 4 ? parseInt(state.conModifier) : 0);
    state.currentCharges = max;
    updateUI();
    saveData();
};

document.getElementById('conModMain').onchange = (e) => {
    state.conModifier = e.target.value;
    updateUI();
    saveData();
};

function showSavePopup() {
    const popupDC = Math.floor(state.count / 5) + 3; // Actual DC - 1
    document.getElementById('popupDC').innerText = popupDC;
    openModal('saveModal');
}

document.getElementById('failBtn').onclick = () => {
    state.hasFailedSave = true;
    if (state.corruptionLVL < 5) state.corruptionLVL++;
    closeModal('saveModal');
    updateUI();
    saveData();
};

document.getElementById('succeedBtn').onclick = () => {
    state.hasFailedSave = true;
    closeModal('saveModal');
    updateUI();
    saveData();
};

// Menu Actions
document.getElementById('resetBtn').onclick = () => {
    if (confirm('Reset everything?')) {
        state = {
            count: 0, corruptionLVL: 0, frozenDC: 4, 
            currentTheme: state.currentTheme, currentCharges: 3, 
            conModifier: 0, hasFailedSave: false
        };
        document.getElementById('conModMain').value = 0;
        updateUI();
        saveData();
        closeDrawer('leftDrawer');
    }
};

document.getElementById('manualEntryBtn').onclick = () => {
    document.getElementById('manualUses').value = state.count;
    document.getElementById('manualLvl').value = state.corruptionLVL;
    openModal('manualModal');
};

document.getElementById('saveManual').onclick = () => {
    const uses = parseInt(document.getElementById('manualUses').value);
    const lvl = parseInt(document.getElementById('manualLvl').value);

    if (lvl >= 0 && lvl <= 5) {
        state.count = uses;
        state.corruptionLVL = lvl;
        if (lvl > 0) state.hasFailedSave = true;
        if (lvl >= 5) state.frozenDC = Math.floor(uses / 5) + 4;
        
        closeModal('manualModal');
        updateUI();
        saveData();
        closeDrawer('leftDrawer');
    } else {
        document.getElementById('manualError').classList.remove('hidden');
    }
};

// Theme Switching
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    state.currentTheme = theme;
}

document.querySelectorAll('input[name="theme"]').forEach(radio => {
    radio.onchange = (e) => {
        applyTheme(e.target.value);
        saveData();
    };
});

// Drawer & Modal Controllers
document.getElementById('menuBtn').onclick = () => openDrawer('leftDrawer');
document.getElementById('effectsBtn').onclick = () => openDrawer('rightDrawer');
document.getElementById('overlay').onclick = () => {
    closeDrawer('leftDrawer');
    closeDrawer('rightDrawer');
};

function openDrawer(id) {
    document.getElementById(id).classList.add('open');
    document.getElementById('overlay').classList.add('open');
}

function closeDrawer(id) {
    document.getElementById(id).classList.remove('open');
    document.getElementById('overlay').classList.remove('open');
}

function openModal(id) {
    document.getElementById(id).classList.add('open');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
    document.getElementById('manualError').classList.add('hidden');
}

document.getElementById('cancelManual').onclick = () => closeModal('manualModal');

// Init
loadData();
