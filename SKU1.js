// ==UserScript==
// @name         Customw
// @namespace    http://tampermonkey.net/
// @version      3.3
// @description  Firebase dashboard with Add, Edit, Delete, and Search features
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const firebaseConfig = {
        apiKey: "AIzaSyB5k4ktm_k0FL2Esq2szyEz6uQe5d6smPI",
        authDomain: "forfun-5584e.firebaseapp.com",
        databaseURL: "https://forfun-5584e-default-rtdb.firebaseio.com",
        projectId: "forfun-5584e",
        storageBucket: "forfun-5584e.appspot.com",
        messagingSenderId: "103887112043",
        appId: "1:103887112043:web:72337f8a4fbe9944996e2e",
        measurementId: "G-MRHBC0VM1E"
    };

    let detectionInterval;
    let clockInterval;

    function loadFirebaseScripts(callback) {
        const scripts = [
            "https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js",
            "https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js"
        ];
        let loaded = 0;
        scripts.forEach(src => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => {
                loaded++;
                if (loaded === scripts.length) callback();
            };
            document.head.appendChild(script);
        });
    }

    function waitForFirebase(callback) {
        const interval = setInterval(() => {
            if (window.firebase && firebase.apps) {
                clearInterval(interval);
                callback();
            }
        }, 100);
    }

function makeDraggable(element) {
    let isDragging = false;
    let startX, startY;
    let origX, origY;

    // Make sure element has absolute positioning
    element.style.position = 'absolute';

    // Initialize position if not set
    if (!element.style.left) element.style.left = '0px';
    if (!element.style.top) element.style.top = '0px';

    element.addEventListener('mousedown', (e) => {
        // Only start drag if clicked near top 30px (header area)
        const rect = element.getBoundingClientRect();
        if (e.clientY - rect.top <= 30) {
            e.preventDefault(); // Prevent text selection while dragging
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            origX = parseInt(element.style.left, 10);
            origY = parseInt(element.style.top, 10);
            element.style.cursor = 'grabbing';

            // Optional: Disable text selection on body while dragging
            document.body.style.userSelect = 'none';
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        e.preventDefault(); // Prevent text selection

        let dx = e.clientX - startX;
        let dy = e.clientY - startY;

        // Calculate new position
        let newX = origX + dx;
        let newY = origY + dy;

        // Optional: limit drag inside viewport (comment if not needed)
        const winWidth = window.innerWidth;
        const winHeight = window.innerHeight;
        const elRect = element.getBoundingClientRect();

        // Clamp newX and newY so element stays visible
        newX = Math.min(Math.max(0, newX), winWidth - elRect.width);
        newY = Math.min(Math.max(0, newY), winHeight - elRect.height);

        element.style.left = newX + 'px';
        element.style.top = newY + 'px';
    });

    document.addEventListener('mouseup', (e) => {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'default';

            // Re-enable text selection
            document.body.style.userSelect = '';
        }
    });
}

      // Remove previous panel if exists
  document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.altKey && e.key === '*') {
    togglePanel();
  }
});

function togglePanel() {
  const panel = document.getElementById("eod-panel");
  if (panel) {
    panel.remove();
  } else {
    createPanel();
  }
}

function createPanel() {
  const old = document.getElementById("eod-panel");
  if (old) old.remove();

  // Main panel container - compact version
  const panel = document.createElement("div");
  panel.id = "eod-panel";
  panel.style = `
    position: absolute;
    top: 150px;
    left: 400px;
    width: 280px;
    min-width: 220px;
    max-width: 420px;
    background: #1e1e1e;
    color: white;
    border: 1px solid #555;
    padding: 12px;
    border-radius: 12px;
    font-family: Arial, sans-serif;
    z-index: 9999;
    cursor: move;
    box-sizing: border-box;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  `;

  panel.innerHTML = `
    <div style="margin-bottom: 15px; font-weight: bold; font-size: 16px; border-bottom: 1px solid #555; padding-bottom: 5px;">
      EOD Generator
    </div>
    <div style="margin-bottom: 10px;">
      <div style="margin-bottom: 5px;">Title:</div>
      <input id="eod-title" type="text" style="width:100%; background: #2d2d2d; color: white; border: 1px solid #555; padding: 5px; border-radius: 4px;" value="EOD AM SHIFT TEAM ">
    </div>
    <div style="margin-bottom: 10px;">
      <div style="margin-bottom: 5px;">Date:</div>
      <input id="eod-date" type="text" style="width:100%; background: #2d2d2d; color: white; border: 1px solid #555; padding: 5px; border-radius: 4px;" Placeholder="Input Date" value="">
    </div>
    <div style="display: flex; gap: 5px; margin-bottom: 10px;">
      <button id="paste-modal-btn" style="flex:1; background: #333; color: white; border: 1px solid #555; padding: 5px; border-radius: 4px; cursor: pointer;">📋 Paste Data</button>
      <button id="manual-modal-btn" style="flex:1; background: #333; color: white; border: 1px solid #555; padding: 5px; border-radius: 4px; cursor: pointer;">✏️ Manual Entry</button>
    </div>
    <div style="display: flex; gap: 5px;">
      <button id="preview-btn" style="flex:1; background: #4CAF50; color: white; border: none; padding: 5px; border-radius: 4px; cursor: pointer;">👁️ Preview</button>
      <button id="close-eod" style="flex:1; background: #f44336; color: white; border: none; padding: 5px; border-radius: 4px; cursor: pointer;">❌ Close</button>
    </div>
  `;
  makeDraggable(panel)
  document.body.appendChild(panel);

  // Data storage
  let entries = [];

// Create modal function with singleton pattern
function createModal(title, content, width = '500px', height = '400px') {
  // Prevent multiple modals
  const existingModal = document.getElementById('custom-modal');
  if (existingModal) return null;

  const modal = document.createElement('div');
  modal.id = 'custom-modal'; // add an id to detect it later
  modal.style = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: ${width};
    height: ${height};
    max-height: 80vh;
    background: #1e1e1e;
    color: white;
    border: 1px solid #555;
    padding: 15px;
    border-radius: 12px;
    font-family: Arial, sans-serif;
    z-index: 10000;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
  `;

  modal.innerHTML = `
    <div style="display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #555; padding-bottom: 5px;">
      <div style="font-weight: bold; font-size: 16px;">${title}</div>
      <button id="close-modal" style="background: none; border: none; color: white; cursor: pointer;">✕</button>
    </div>
    <div id="modal-content" style="flex: 1; overflow-y: auto; margin-bottom: 15px;">
      ${content}
    </div>
    <div style="display: flex; gap: 5px;">
      <button id="modal-confirm" style="flex: 1; background: #4CAF50; color: white; border: none; padding: 5px; border-radius: 4px; cursor: pointer;">Confirm</button>
      <button id="modal-cancel" style="flex: 1; background: #f44336; color: white; border: none; padding: 5px; border-radius: 4px; cursor: pointer;">Cancel</button>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => {
    modal.remove();
  };

  modal.querySelector('#close-modal').onclick = closeModal;
  modal.querySelector('#modal-cancel').onclick = closeModal;

  return {
    modal,
    content: modal.querySelector('#modal-content'),
    confirmBtn: modal.querySelector('#modal-confirm'),
    close: closeModal
  };
}


  // Paste Data Modal
  document.getElementById('paste-modal-btn').addEventListener('click', function() {
    const { content, confirmBtn, close } = createModal('Paste Data', `
      <div style="margin-bottom: 10px;">
        <div style="margin-bottom: 5px;">Paste tab-separated data:</div>
        <textarea id="paste-data" style="width:100%; height: 160px; background: #2d2d2d; color: white; border: 1px solid #555; padding: 5px; border-radius: 4px;" placeholder="PASTE ONLY HERE. FERNANDO EPIL INC CC Sched SKU Encode Loss%"></textarea>
      </div>
    `, '480px', '380px');

    confirmBtn.addEventListener('click', function() {
      const pasteData = content.querySelector('#paste-data').value.trim();
      if (!pasteData) {
        alert('Please paste some data first!');
        return;
      }

      const lines = pasteData.split('\n');
      entries = [];

      lines.forEach(line => {
        if (line.toLowerCase().includes('no sku')) return;

        const values = line.trim().split('\t');
        if (values.length < 6) return;

        entries.push({
          name: values[0] || '',
          inc: values[1] || '0',
          cancel: values[2] || '0',
          sched: values[3] || '0',
          encoded: values[5] || '0',
          loss: values[6]?.replace('%', '') || '0'
        });
      });

      close();
      alert(`Added ${entries.length} entries`);
    });
  });

  // Manual Entry Modal
  document.getElementById('manual-modal-btn').addEventListener('click', function() {
      const { content, confirmBtn, close } = createModal('Manual Entry', `
      <div id="manual-entries" style="margin-bottom: 10px;"></div>
      <button id="add-entry" style="width:100%; background: #333; color: white; border: 1px solid #555; padding: 5px; border-radius: 4px; margin-bottom: 10px; cursor: pointer;">+ Add Entry</button>
    `, '550px', '450px');

    const entriesContainer = content.querySelector('#manual-entries');

    function addEntry(entry = {}) {
      const entryDiv = document.createElement('div');
      entryDiv.style = 'display: grid; grid-template-columns: 2fr 60px 70px 70px 80px 70px 30px; gap: 5px; margin-bottom: 5px; align-items: center;';
      entryDiv.innerHTML = `
        <input type="text" placeholder="Name" style="flex:2; background: #2d2d2d; color: white; border: 1px solid #555; padding: 5px; border-radius: 4px;" value="${entry.name || ''}">
        <input type="number" placeholder="INC" style="width:60px; background: #2d2d2d; color: white; border: 1px solid #555; padding: 5px; border-radius: 4px;" value="${entry.inc || '0'}">
        <input type="number" placeholder="Cancel" style="width:70px; background: #2d2d2d; color: white; border: 1px solid #555; padding: 5px; border-radius: 4px;" value="${entry.cancel || '0'}">
        <input type="number" placeholder="Sched" style="width:70px; background: #2d2d2d; color: white; border: 1px solid #555; padding: 5px; border-radius: 4px;" value="${entry.sched || '0'}">
        <input type="number" placeholder="Encoded" style="width:80px; background: #2d2d2d; color: white; border: 1px solid #555; padding: 5px; border-radius: 4px;" value="${entry.encoded || '0'}">
        <input type="text" placeholder="%Loss" style="width:70px; background: #2d2d2d; color: white; border: 1px solid #555; padding: 5px; border-radius: 4px;" value="${entry.loss || '0'}">
        <button class="remove-entry" style="width:30px; background: #f44336; color: white; border: none; padding: 5px; border-radius: 4px; cursor: pointer;">✕</button>
      `;
      entryDiv.querySelector('.remove-entry').addEventListener('click', () => entryDiv.remove());
      entriesContainer.appendChild(entryDiv);
    }

    // Add initial empty entry
    addEntry();

    content.querySelector('#add-entry').addEventListener('click', () => addEntry());

    confirmBtn.addEventListener('click', function() {
      entries = [];
      const entryDivs = entriesContainer.querySelectorAll('div');

      entryDivs.forEach(div => {
        const inputs = div.querySelectorAll('input');
        entries.push({
          name: inputs[0].value.trim(),
          inc: inputs[1].value || '0',
          cancel: inputs[2].value || '0',
          sched: inputs[3].value || '0',
          encoded: inputs[4].value || '0',
          loss: inputs[5].value || '0'
        });
      });

      close();
      alert(`Added ${entries.length} entries`);
    });
  });

  // Preview/Generate Modal
  document.getElementById('preview-btn').addEventListener('click', function() {
    if (entries.length === 0) {
      alert('No entries to preview!');
      return;
    }

    const title = document.getElementById("eod-title").value.trim();
    const date = document.getElementById("eod-date").value.trim();
    let output = `${title}\n    (${date})\n\n`;

    let totalEncoded = 0, totalINC = 0, totalCancel = 0, totalSched = 0;

    entries.forEach(entry => {
      const inc = +entry.inc || 0;
      const cancel = +entry.cancel || 0;
      const sched = +entry.sched || 0;
      const encoded = +entry.encoded || 0;
      let loss = entry.loss || '0';

      if (loss && !loss.includes('%')) loss += '%';

      totalEncoded += encoded;
      totalINC += inc;
      totalCancel += cancel;
      totalSched += sched;

      output += `NAME : ${entry.name}\nPOSITION: VALIDATOR\nVALIDATED ORDERS: ${encoded}\nINC: ${inc}\n`;
      if (cancel > 0) output += `CANCELLATIONS: ${cancel}\n`;
      if (sched > 0) output += `SCHEDULED: ${sched}\n`;
      output += `%LOSS: ${loss}\n\n`;
    });

    // Format totals with commas
    const formattedEncoded = totalEncoded.toLocaleString();
    const formattedINC = totalINC.toLocaleString();
    const formattedCancel = totalCancel.toLocaleString();
    const formattedSched = totalSched.toLocaleString();

    output += `TOTAL OF ENCODED - ${formattedEncoded}\n`;
    output += `TOTAL OF INC- ${formattedINC}\n`;
    output += `TOTAL OF CC- ${formattedCancel}\n`;
    output += `TOTAL OF SCHEDULED: ${formattedSched}`;

    const { content, confirmBtn } = createModal('Preview & Generate', `
      <textarea id="output-preview" style="width:100%; height: 300px; background: #2d2d2d; color: white; border: 1px solid #555; padding: 5px; border-radius: 4px; font-family: monospace; white-space: pre;">${output}</textarea>
      <div style="margin-top: 10px; font-size: 12px; color: #aaa;">
        Edit the output above if needed before copying
      </div>
    `, '600px', '500px');

    confirmBtn.textContent = 'Copy to Clipboard';
    confirmBtn.addEventListener('click', function() {
      const finalOutput = content.querySelector('#output-preview').value;
      navigator.clipboard.writeText(finalOutput).then(() => {
        alert('EOD report copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard. Check console for details.');
      });
    });
  });

  // Close the panel
  document.getElementById("close-eod").addEventListener('click', () => panel.remove());
}

function hideElement(element) {
    if (element) element.style.display = 'none';
}

function showElement(element) {
    if (element) element.style.display = 'block';
}

// Create the main panel container
const cx = document.createElement('div');
cx.id = 'cx';
cx.style.cssText = `
    position: fixed;
    top: 30px;
    left: 100px;
    width: 320px;
    background: #111;
    color: white;
    border: 1px solid #444;
    padding: 10px;
    border-radius: 12px;
    font-family: Arial, sans-serif;
    z-index: 9999;
    display: none;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
`;

// Header with title and settings icon
const header = document.createElement('div');
header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: move;
    margin-bottom: 8px;
`;

const title = document.createElement('strong');
title.textContent = '📋 CX CHAT';
header.appendChild(title);

const settingsBtn = document.createElement('button');
settingsBtn.textContent = '⚙️';
settingsBtn.style.cssText = `
    background: none;
    border: none;
    color: white;
    font-size: 16px;
    cursor: pointer;
`;
header.appendChild(settingsBtn);
cx.appendChild(header);

// Settings panel
const settingsPanel = document.createElement('div');
settingsPanel.style.cssText = `
    display: none;
    background: #222;
    padding: 8px;
    border-radius: 8px;
    margin-bottom: 10px;
    font-size: 14px;
`;

settingsBtn.onclick = () => {
    settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
};

const shortcutLabel = document.createElement('div');
shortcutLabel.textContent = '🔑 Toggle Shortcut:';
shortcutLabel.style.marginBottom = '5px';

const shortcutInput = document.createElement('input');
shortcutInput.type = 'text';
shortcutInput.placeholder = 'Press shortcut...';
shortcutInput.style.cssText = `
    width: 100%;
    padding: 6px;
    background: #333;
    color: white;
    border: 1px solid #555;
    border-radius: 4px;
    margin-top: 4px;
`;

// Cookie utility
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Default shortcut
let currentShortcut = {
    ctrl: true,
    alt: true,
    shift: false,
    key: 'KeyO'
};

// Load saved shortcut
const savedShortcut = getCookie('cxShortcut');
if (savedShortcut) {
    currentShortcut = JSON.parse(savedShortcut);
    updateShortcutDisplay();
}

function updateShortcutDisplay() {
    const parts = [];
    if (currentShortcut.ctrl) parts.push('Ctrl');
    if (currentShortcut.alt) parts.push('Alt');
    if (currentShortcut.shift) parts.push('Shift');
    parts.push(currentShortcut.key.replace('Key', '').replace('Digit', ''));
    shortcutInput.value = parts.join(' + ');
}

shortcutInput.addEventListener('keydown', (e) => {
    e.preventDefault();
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;

    currentShortcut = {
        ctrl: e.ctrlKey,
        alt: e.altKey,
        shift: e.shiftKey,
        key: e.code
    };
    document.cookie = `cxShortcut=${JSON.stringify(currentShortcut)}; path=/; max-age=${60 * 60 * 24 * 30}`;
    updateShortcutDisplay();
});

settingsPanel.appendChild(shortcutLabel);
settingsPanel.appendChild(shortcutInput);
cx.appendChild(settingsPanel);

// Chat area container
const chatContainer = document.createElement('div');
chatContainer.style.cssText = `
    max-height: 300px;
    overflow-y: auto;
    background: #1a1a1a;
    padding: 10px;
    border-radius: 8px;
    font-size: 14px;
`;
cx.appendChild(chatContainer);

// Append to body
document.body.appendChild(cx);

// ✅ Combined method: gets customer messages using both strategies
function getAllCustomerMessages() {
    const messages = [];

    // Method 1: Your original method
    const container = document.querySelector('.message-list.media-list-conversation');
    if (container) {
        const clientMessages = container.querySelectorAll('.client-message > div');
        clientMessages.forEach(div => {
            const text = div.innerHTML.trim();
            if (text) messages.push(text);
        });
    }

    // Method 2: Visual layout detection
    const visualMessages = document.querySelectorAll('.box-media');
    visualMessages.forEach(box => {
        const senderSpan = box.querySelector('span');
        const msgBox = box.querySelector('.message');

        const isCustomerMessage =
            senderSpan?.style?.alignSelf === 'flex-start' ||
            msgBox?.style?.background === 'rgb(255, 255, 255)';

        if (isCustomerMessage && msgBox?.innerHTML) {
            const html = msgBox.innerHTML.trim();
            if (html) messages.push(html);
        }
    });

    return messages;
}

const toast = document.createElement('div');
toast.style.cssText = `
   position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 99999;
`;
toast.id = 'cx-toast';
document.body.appendChild(toast);

const toastQueue = [];
let isToastShowing = false;

function showToast(message) {
  toastQueue.push(message);
  if (!isToastShowing) {
    showNextToast();
  }
}

function showNextToast() {
  if (toastQueue.length === 0) {
    isToastShowing = false;
    return;
  }

  isToastShowing = true;
  const message = toastQueue.shift();
  toast.textContent = message;
  toast.style.opacity = 1;

  setTimeout(() => {
    toast.style.opacity = 0;
    setTimeout(showNextToast, 300); // Small gap before next toast
  }, 2000); // Show each toast for 4 seconds
}


function normalizeAndCopyPhone(rawText) {
    // 1. Clean and normalize the input
    let phone = rawText.trim()
        .replace(/[^\d+]/g, '') // Remove non-digit/non-plus
        .replace(/[Oo]/g, '0'); // Replace letter O with zero

    // 2. Convert to standard PH format (09XXXXXXXXX)
    if (phone.startsWith('+63')) {
        phone = '0' + phone.slice(3);
    } else if (phone.startsWith('63')) {
        phone = '0' + phone.slice(2);
    } else if (phone.startsWith('9') && phone.length === 10) {
        phone = '0' + phone;
    }

    // 3. Strict PH mobile number validation
    if (!/^09\d{9}$/.test(phone)) {
        showToast(`❌ Invalid: Must be 11 digits starting with 09`);
        return;
    }

    const digits = phone.slice(2); // Only the last 9 digits

    // 4. Fake number detection – warning only
    const fakeDetected =
        /^(\d)\1{8}$/.test(digits) || // All same digit
        /(?:012345678|123456789|234567890|345678901|456789012|567890123|678901234|789012345|890123456|901234567)/.test(digits) || // Sequential
        /(?:987654321|876543210|765432109|654321098|543210987|432109876|321098765|210987654|109876543)/.test(digits) || // Reverse sequential
        /(\d{2})\1{4}/.test(digits) || // Repeating 2-digit group
        /(\d{3})\1{3}/.test(digits) || // Repeating 3-digit group
        /^(\d)(\d)\1\2\1\2\1\2$/.test(digits) || // Alternating digits
        digits === digits.split('').reverse().join(''); // Mirrored

    if (fakeDetected) {
        showToast(`⚠ Possible fake number: Detected a common pattern. Still copied, but not 100% accurate.`);
    }

    // 5. Validate against PH prefixes (2024)
    const validPrefixes = new Set([
        // Globe/TM
        '0817','0905','0906','0915','0916','0917','0926','0927','0935','0936',
        '0937','0945','0953','0954','0955','0956','0965','0966','0967','0975',
        '0976','0977','0978','0979','0995','0996','0997',
        // Smart/TNT/Sun
        '0813','0907','0908','0909','0910','0911','0912','0913','0914','0918',
        '0919','0920','0921','0928','0929','0930','0938','0939','0946','0947',
        '0948','0949','0950','0951','0961','0963','0964','0968','0969','0970',
        '0971','0980','0981','0982','0985','0989','0998','0999',
        // DITO
        '0895','0896','0897','0898','0991','0992','0993','0994'
    ]);

    const prefix4 = phone.slice(0, 4);
    const prefix5 = phone.slice(0, 5);

    if (!validPrefixes.has(prefix4) && !validPrefixes.has(prefix5)) {
        showToast(`⚠ Warning: Unrecognized carrier prefix (${prefix4})`);
    }

    // 6. Copy to clipboard with fallback
    const copyToClipboard = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(phone)
                .then(() => showToast(`✅ Copied: ${phone}`))
                .catch(() => fallbackCopy(phone));
        } else {
            fallbackCopy(phone);
        }
    };

    const fallbackCopy = (text) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(`✅ Copied: ${text} (fallback method)`);
    };

    copyToClipboard();
}



function renderMessages(messages) {
    chatContainer.innerHTML = '';
    if (messages.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.textContent = 'No messages found';
        emptyMsg.style.cssText = 'color: #aaa; text-align: center;';
        chatContainer.appendChild(emptyMsg);
        return;
    }

    messages.forEach(msgHtml => {
        const bubble = document.createElement('div');
        bubble.style.cssText = `
            background: #333;
            color: #eee;
            padding: 8px;
            border-radius: 8px;
            margin-bottom: 6px;
            white-space: pre-wrap;
        `;
        bubble.innerHTML = msgHtml;

        // 🔥 After inserting HTML, find and bind listeners
        const spans = bubble.querySelectorAll('.phone-tag');
        spans.forEach(span => {
            span.style.cursor = 'pointer';
            span.title = 'Click to copy';
            span.addEventListener('click', () => {
                normalizeAndCopyPhone(span.textContent);
            });
        });

        chatContainer.appendChild(bubble);
    });

    chatContainer.scrollTop = chatContainer.scrollHeight;
}


// 🔥 Shortcut logic (open panel + show messages)
document.addEventListener('keydown', (e) => {
    const match = (
        e.ctrlKey === currentShortcut.ctrl &&
        e.altKey === currentShortcut.alt &&
        e.shiftKey === currentShortcut.shift &&
        e.code === currentShortcut.key
    );

    // Reset shortcut with Ctrl+Alt+Shift+R
    if (e.ctrlKey && e.altKey && e.shiftKey && e.code === 'KeyR') {
        e.preventDefault();
        currentShortcut = {
            ctrl: true,
            alt: true,
            shift: false,
            key: 'KeyO'
        };
        document.cookie = `cxShortcut=${JSON.stringify(currentShortcut)}; path=/; max-age=${60 * 60 * 24 * 30}`;
        updateShortcutDisplay();
        alert('🔁 Shortcut reset to default: Ctrl + Alt + O');
        return;
    }

    // Toggle panel with shortcut
    if (match) {
        e.preventDefault();
        if (cx.style.display === 'none') {
            renderMessages(getAllCustomerMessages());
            cx.style.display = 'block';
        } else {
            cx.style.display = 'none';
        }
    }

    // Shift = refresh messages (if open)
    if (cx.style.display === 'block' && e.key === 'Shift' && !e.ctrlKey && !e.altKey) {
        renderMessages(getAllCustomerMessages());
    }
});

// Drag logic
let isDragging = false;
let offsetX, offsetY;

header.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - cx.getBoundingClientRect().left;
    offsetY = e.clientY - cx.getBoundingClientRect().top;
    document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    cx.style.left = `${e.clientX - offsetX}px`;
    cx.style.top = `${e.clientY - offsetY}px`;
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.userSelect = '';
});



makeDraggable(cx);


const STORAGE_KEY = 'customSpiels';

const savedSpiels = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const form = document.createElement('div');
form.id = 'spielPanel';
form.style = `
    position: fixed;
    top: 150px;
    left: 100px;
    width: 320px;
    max-height: 480px;
    background: black;
    color: white;
    border: 1px solid white;
    padding: 15px 15px 10px 15px;
    border-radius: 12px;
    font-family: Arial, sans-serif;
    z-index: 9999;
    display: none;
    cursor: move;
    box-sizing: border-box;
    user-select: none;
`;

// Removed: form.appendChild(title);
const container = document.createElement('div');
container.style = `
    max-height: 350px;
    overflow-y: auto;
    padding-right: 6px; /* space so scrollbar doesn't cover content */
`;

// Create title/header element for the shortcut panel
const shortcutTitle = document.createElement('div');
shortcutTitle.textContent = '🔑 Shortcut Custom Spiel Key';  // or any of the names above
shortcutTitle.style = `
    font-weight: bold;
    font-size: 18px;
    padding: 8px 0;
    color: white;
    user-select: none;
`;

// Append title at the top before container content
form.insertBefore(shortcutTitle, form.firstChild);

form.appendChild(container);


const addBtn = document.createElement('button');
addBtn.textContent = '➕ Add Spiel';
addBtn.style = `
    width: 100%;
    margin-top: 12px;
    background: #444;
    color: white;
    border: none;
    padding: 10px 0;
    font-size: 14px;
    border-radius: 8px;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.3s ease;
`;
addBtn.onmouseenter = () => addBtn.style.background = '#666';
addBtn.onmouseleave = () => addBtn.style.background = '#444';

form.appendChild(addBtn);
document.body.appendChild(form);

// Toggle panel display with Alt + Backquote
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.code === 'KeyP') {
        e.preventDefault();
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
});


function getKeyCombo(e) {
    const modifiers = [];
    if (e.ctrlKey) modifiers.push('Ctrl');
    if (e.altKey) modifiers.push('Alt');
    if (e.shiftKey) modifiers.push('Shift');

    let key = e.key;

    if (key === 'Control' || key === 'Shift' || key === 'Alt') return null;

    if (key.length === 1) {
        key = key.toUpperCase();
    }

    return [...modifiers, key].join('+');
}

function renderSpiels() {
    container.innerHTML = '';
    savedSpiels.forEach((spiel, index) => {
        const wrapper = document.createElement('div');
        wrapper.style = `
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            gap: 8px;
            width: 100%;
            box-sizing: border-box;
        `;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = spiel.text;
        input.placeholder = 'Enter spiel text';
        input.style = `
            flex-grow: 1;
            min-width: 0;
            padding: 6px 8px;
            font-size: 13px;
            border-radius: 6px;
            border: 1px solid #444;
            background: #fff;
            color: #000;
        `;
        input.addEventListener('input', () => {
            spiel.text = input.value;
            saveSpiels();
        });

        const hotkeyInput = document.createElement('input');
        hotkeyInput.type = 'text';
        hotkeyInput.value = spiel.hotkey || '';
        hotkeyInput.placeholder = 'Press key';
        hotkeyInput.readOnly = true;
        hotkeyInput.style = `
            width: 90px;
            padding: 6px 6px;
            font-size: 12px;
            border-radius: 6px;
            border: 1px solid #444;
            background: #fff;
            color: #000;
            text-align: center;
            user-select: none;
            flex-shrink: 0;
        `;

        hotkeyInput.addEventListener('focus', () => {
            const setHotkey = (e) => {
                e.preventDefault();
                const combo = getKeyCombo(e);
                if (!combo) return; // ignore modifier-only

                // Restrict certain shortcuts
                if (combo === 'Alt+Z' || combo === 'Alt+X') {
                    alert(`Shortcut "${combo}" is reserved and cannot be used.`);
                    hotkeyInput.value = spiel.hotkey || '';
                    document.removeEventListener('keydown', setHotkey);
                    hotkeyInput.blur();
                    return;
                }

                // Check for duplicates
                const duplicateIndex = savedSpiels.findIndex((s, i) => s.hotkey === combo && i !== index);
                if (duplicateIndex !== -1) {
                    alert(`Shortcut "${combo}" already assigned. Removing from previous spiel.`);
                    savedSpiels[duplicateIndex].hotkey = '';
                }

                hotkeyInput.value = combo;
                spiel.hotkey = combo;
                saveSpiels();
                renderSpiels();

                document.removeEventListener('keydown', setHotkey);
                hotkeyInput.blur();
            };
            document.addEventListener('keydown', setHotkey);
        });

        const delBtn = document.createElement('button');
        delBtn.textContent = '✕';
        delBtn.title = 'Delete spiel';
        delBtn.style = `
            background: transparent;
            border: none;
            color: #ff5c5c;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            line-height: 24px;
            text-align: center;
            user-select: none;
            flex-shrink: 0;
            transition: color 0.2s;
        `;
        delBtn.onmouseenter = () => delBtn.style.color = '#ff1c1c';
        delBtn.onmouseleave = () => delBtn.style.color = '#ff5c5c';

        delBtn.onclick = () => {
            savedSpiels.splice(index, 1);
            saveSpiels();
            renderSpiels();
        };

        wrapper.appendChild(input);
        wrapper.appendChild(hotkeyInput);
        wrapper.appendChild(delBtn);
        container.appendChild(wrapper);
    });
}

function saveSpiels() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSpiels));
}

addBtn.addEventListener('click', () => {
    savedSpiels.push({ text: '', hotkey: '' });
    saveSpiels();
    renderSpiels();
});

document.addEventListener('keydown', (e) => {
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        return; // avoid triggering while typing
    }

    const combo = getKeyCombo(e);
    if (!combo) return;

    for (const spiel of savedSpiels) {
        if (spiel.hotkey && spiel.hotkey === combo) {
            navigator.clipboard.writeText(spiel.text);
            break;
        }
    }
});

renderSpiels();


    makeDraggable(form);


function createDashboard() {
  const dashboard = document.createElement('div');
  dashboard.id = 'dashboard';
  dashboard.style.cssText = `
    position: fixed;
    top: 50px;
    left: 50px;
    width: 280px;
    background: #1e1e2f;
    color: #eee;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    padding: 20px 25px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    z-index: 9999;
    user-select: none;
  `;

  dashboard.innerHTML = `
    <div style="
      position: relative;
      padding-bottom: 10px;
      border-bottom: 1px solid #444;
    ">
      <strong style="
        font-size: 18px;
        line-height: 1.2;
        letter-spacing: 0.05em;
        user-select: none;
      ">Dashboard</strong>
      <span id="exitBtn" style="
        position: absolute;
        top: 0;
        right: 0;
        cursor: pointer;
        color: #bbb;
        font-size: 22px;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 6px;
        transition: background-color 0.3s ease, color 0.3s ease;
        user-select: none;
      " title="Close Dashboard">&times;</span>
    </div>
    <div style="
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    ">
      <button id="addItemBtn" style="
        width: 100%;
        padding: 12px 0;
        background: #3a3a5e;
        border: none;
        border-radius: 8px;
        color: #eee;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 3px 8px rgba(0,0,0,0.2);
        transition: background-color 0.25s ease, box-shadow 0.25s ease;
      ">Add Item</button>
      <button id="updateBtn" style="
        width: 100%;
        padding: 12px 0;
        background: #3a3a5e;
        border: none;
        border-radius: 8px;
        color: #eee;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 3px 8px rgba(0,0,0,0.2);
        transition: background-color 0.25s ease, box-shadow 0.25s ease;
      ">Update</button>
      <button id="startBtn" style="
        width: 100%;
        padding: 12px 0;
        background: #3a3a5e;
        border: none;
        border-radius: 8px;
        color: #eee;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 3px 8px rgba(0,0,0,0.2);
        transition: background-color 0.25s ease, box-shadow 0.25s ease;
      ">Start</button>
      <button id="notesBtn" style="
  width: 100%;
  padding: 12px 0;
  background: #3a3a5e;
  border: none;
  border-radius: 8px;
  color: #eee;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(0,0,0,0.2);
  transition: background-color 0.25s ease, box-shadow 0.25s ease;
 ">Open Tag Checker</button>
    </div>
  `;

  document.body.appendChild(dashboard);

const exitBtn = document.getElementById('exitBtn');
exitBtn.addEventListener('mouseenter', () => {
  exitBtn.style.backgroundColor = '#e74c3c';
  exitBtn.style.color = 'white';
});
exitBtn.addEventListener('mouseleave', () => {
  exitBtn.style.backgroundColor = 'transparent';
  exitBtn.style.color = '#bbb';
});

  // Add hover effect on buttons via JS to keep it inline-style only
  const buttons = dashboard.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.backgroundColor = '#5c5ca8';
      btn.style.boxShadow = '0 5px 15px rgba(92, 92, 168, 0.5)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.backgroundColor = '#3a3a5e';
      btn.style.boxShadow = '0 3px 8px rgba(0,0,0,0.2)';
    });
  });


    document.body.appendChild(dashboard);
    makeDraggable(dashboard);

    document.getElementById('addItemBtn').addEventListener('click', () => {
        hideElement(dashboard);
        showElement(document.getElementById('addItemForm'));
    });

    document.getElementById('updateBtn').addEventListener('click', () => {
        hideElement(dashboard);
        refreshItemList();
        showElement(document.getElementById('updateForm'));
    });

    document.getElementById('notesBtn').addEventListener('click', () => {
        if (!document.getElementById('notesPanel')) {
            createNameCheckerPanel();
        }
    });

    document.getElementById('startBtn').addEventListener('click', () => {
        hideElement(dashboard);
        showElement(document.getElementById('startPanel'));
        updateClock();
        clockInterval = setInterval(updateClock, 1000);
        detectAndDisplaySKU(); // Initial detection
        if (detectionInterval) clearInterval(detectionInterval);
        detectionInterval = setInterval(detectAndDisplaySKU, 2000); // Periodic checks
    });


// ✅ Only keep this for exit behavior
exitBtn.addEventListener('click', () => {
  const confirmExit = confirm("Are you sure you want to exit the application?");
  if (confirmExit) {
    hideElement(dashboard);
  }
});

}


function createAddItemForm() {
  const form = document.createElement('div');
  form.id = 'addItemForm';
  form.style.cssText = `
    position: fixed;
    top: 150px;
    left: 100px;
    width: 280px;
    background: #1e1e2f;
    color: #eee;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    padding: 20px 25px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    z-index: 9999;
    display: none;
    cursor: move;
    user-select: none;
  `;

  form.innerHTML = `
    <strong style="
      font-size: 18px;
      line-height: 1.3;
      letter-spacing: 0.05em;
      user-select: none;
      display: block;
      margin-bottom: 15px;
    ">Add Item</strong>
    <input type="text" id="itemName" placeholder="Item name" style="
      width: 100%;
      padding: 10px;
      margin-bottom: 12px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      box-sizing: border-box;
      background: #f0f0f0;
      color: #222;
      outline-color: #5c5ca8;
    ">
    <input type="text" id="itemValue" placeholder="Value" style="
      width: 100%;
      padding: 10px;
      margin-bottom: 20px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      box-sizing: border-box;
      background: #f0f0f0;
      color: #222;
      outline-color: #5c5ca8;
    ">
    <button id="saveBtn" style="
      width: 100%;
      padding: 12px 0;
      background: #3a3a5e;
      border: none;
      border-radius: 8px;
      color: #eee;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 3px 8px rgba(0,0,0,0.2);
      transition: background-color 0.25s ease, box-shadow 0.25s ease;
      margin-bottom: 15px;
    ">Save</button>
    <button id="backBtn" style="
      width: 100%;
      padding: 12px 0;
      background: #3a3a5e;
      border: none;
      border-radius: 8px;
      color: #eee;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 3px 8px rgba(0,0,0,0.2);
      transition: background-color 0.25s ease, box-shadow 0.25s ease;
    ">Back</button>
  `;

  // Hover effect for buttons using JS (since inline styles)
  const buttons = form.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.backgroundColor = '#5c5ca8';
      btn.style.boxShadow = '0 5px 15px rgba(92, 92, 168, 0.5)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.backgroundColor = '#3a3a5e';
      btn.style.boxShadow = '0 3px 8px rgba(0,0,0,0.2)';
    });
  });


        document.body.appendChild(form);
        makeDraggable(form);

        document.getElementById('saveBtn').addEventListener('click', saveItem);
        document.getElementById('backBtn').addEventListener('click', () => {
            hideElement(form);
            showElement(document.getElementById('dashboard'));
        });
    }

    function createNameCheckerPanel() {
  const blackColor = 'rgb(18, 49, 35)';

  const box = document.createElement('div');
  box.id = 'nameCheckerPanel';
  box.style = `
    position: fixed;
    top: 120px;
    left: 100px;
    z-index: 9999;
    background: #1e1e2f;
    color: #eee;
    padding: 12px;
    border-radius: 12px;
    font-family: Arial, sans-serif;
    font-size: 13px;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.5);
    min-width: 260px;
    max-height: 320px;
    overflow: auto;
    cursor: move;
  `;

  box.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
      <div style="font-weight:bold; font-size: 14px;">🧪 Name Auto-Checker</div>
      <button id="closeChecker" style="
        background: #d9534f;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 2px 6px;
        cursor: pointer;
        font-size: 14px;
      ">❌</button>
    </div>
    <button id="runCheck" style="
      margin-bottom: 10px;
      width: 100%;
      padding: 6px;
      background: #5c5ca8;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    ">▶️ Run Check (Ctrl+Shift+X)</button>
    <div id="results" style="
      max-height: 180px;
      overflow-y: auto;
      font-size: 12px;
      line-height: 1.4;
      background: #2c2c2c;
      padding: 8px;
      border-radius: 8px;
      border: 1px solid #444;
    "></div>
  `;

  document.body.appendChild(box);
  makeDraggable(box);

  document.getElementById('closeChecker').onclick = () => box.remove();

  function runCheckAndClick() {
    const allTags = document.querySelectorAll('.tag-filter-item');
    let changed = [], alreadyChecked = [];

    allTags.forEach(item => {
      const tag = item.querySelector('.ant-tag');
      const checkbox = item.querySelector('input[type="checkbox"]');

      if (tag && checkbox && tag.style.backgroundColor === blackColor) {
        const name = tag.textContent.trim();

        if (!checkbox.checked) {
          checkbox.click();
          changed.push(name);
        } else {
          alreadyChecked.push(name);
        }

        tag.style.outline = '1px solid lime';
      }
    });

    const results = document.getElementById('results');
    results.innerHTML = `
      ✅ <b>Now Checked (${changed.length}):</b><br>${changed.join('<br>')}<br><br>
      ✔️ <b>Already Checked (${alreadyChecked.length}):</b><br>${alreadyChecked.join('<br>')}
    `;
  }

  // Trigger via button
  document.getElementById('runCheck').addEventListener('click', runCheckAndClick);

  // Shortcut trigger: Ctrl + Shift + X
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyX') {
      const panel = document.getElementById('nameCheckerPanel');
      if (panel) document.getElementById('runCheck').click();
    }
  });
}


    function saveItem() {
        const name = document.getElementById('itemName').value.trim();
        const value = document.getElementById('itemValue').value.trim();
        if (!name || !value) return alert("Both fields are required!");

        const db = firebase.database();
        const itemsRef = db.ref('items');

        itemsRef.orderByChild('name').equalTo(name).once('value', snapshot => {
            if (snapshot.exists()) {
                alert("❌ Name already exists!");
            } else {
                itemsRef.push({ name, value })
                    .then(() => {
                        alert("✅ Saved!");
                        document.getElementById('itemName').value = '';
                        document.getElementById('itemValue').value = '';
                    });
            }
        });
    }

function createUpdateForm() {
  const updateForm = document.createElement('div');
  updateForm.id = 'updateForm';
  updateForm.style.cssText = `
    position: fixed;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    width: 320px;
    max-width: 90vw;
    max-height: 400px;
    overflow-y: auto;
    background: #1a1a1a;
    color: #eee;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.4);
    padding: 15px 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    z-index: 9999;
    display: none;
    cursor: move;
    box-sizing: border-box;
    user-select: none;
  `;

  updateForm.innerHTML = `
    <div style="
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      user-select: none;
    ">
      <button id="backFromUpdateFormBtn" style="
        background: transparent;
        border: none;
        color: #ccc;
        font-size: 24px;
        font-weight: bold;
        cursor: pointer;
        padding: 0 10px 0 0;
        transition: color 0.3s ease;
      ">←</button>
      <strong style="font-size: 18px;">Update Items</strong>
      <button id="quickUpdateBtn" style="
        background: #5c5ca8;
        border: none;
        border-radius: 6px;
        color: white;
        font-size: 16px;
        cursor: pointer;
        padding: 5px 10px;
        transition: background 0.3s ease;
      ">⚡ Quick</button>
    </div>
    <input type="text" id="searchInput" placeholder="Search item or value..." style="
      width: 100%;
      padding: 8px 10px;
      font-size: 14px;
      border-radius: 8px;
      border: none;
      outline-color: #5c5ca8;
      background: #eee;
      color: #222;
      box-sizing: border-box;
      margin-bottom: 15px;
    ">
    <div id="quickUpdateContainer" style="
      display: none;
      margin-bottom: 15px;
      background: #2c2c2c;
      padding: 10px;
      border-radius: 8px;
    ">
      <input type="text" id="quickUpdateInput" placeholder="Enter new value for all" style="
        width: 70%;
        padding: 6px 8px;
        border-radius: 6px;
        border: none;
        outline-color: #5c5ca8;
        font-size: 14px;
        color: #222;
        background: #eee;
      ">
      <button id="applyQuickUpdateBtn" style="
        width: 28%;
        margin-left: 2%;
        background: #5c5ca8;
        border: none;
        border-radius: 6px;
        color: white;
        font-size: 14px;
        cursor: pointer;
        padding: 6px;
        transition: background 0.3s ease;
      ">Apply</button>
    </div>
    <div id="itemList" style="
      max-height: 270px;
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: #5c5ca8 transparent;
    "></div>
  `;

  // Custom scrollbar styles for Webkit browsers
  const style = document.createElement('style');
  style.textContent = `
    #updateForm #itemList::-webkit-scrollbar {
      width: 8px;
    }
    #updateForm #itemList::-webkit-scrollbar-track {
      background: transparent;
    }
    #updateForm #itemList::-webkit-scrollbar-thumb {
      background-color: #5c5ca8;
      border-radius: 10px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
  `;
  document.head.appendChild(style);

  // Hover effect for back button
  const backBtn = updateForm.querySelector('#backFromUpdateFormBtn');
  backBtn.addEventListener('mouseenter', () => backBtn.style.color = '#8a8ae0');
  backBtn.addEventListener('mouseleave', () => backBtn.style.color = '#ccc');

  document.body.appendChild(updateForm);
  makeDraggable(updateForm);

  // Event listeners
  // Show/hide the quick update input when ⚡ Quick is clicked
  document.getElementById('quickUpdateBtn').addEventListener('click', () => {
    const quickContainer = document.getElementById('quickUpdateContainer');
    quickContainer.style.display = quickContainer.style.display === 'none' ? 'block' : 'none';
  });
    document.getElementById('backFromUpdateFormBtn').addEventListener('click', () => {
  hideElement(updateForm); // Hide the update form
  showElement(document.getElementById('dashboard')); // Show dashboard
});

  // APPLY Quick Update Logic
  document.getElementById('applyQuickUpdateBtn').addEventListener('click', () => {
    const newValue = document.getElementById('quickUpdateInput').value.trim();
    const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
    const db = firebase.database();
    const itemsRef = db.ref('items');

    if (newValue === '' || searchInput === '') {
      alert('Please enter both a new value and the SKU name to search.');
      return;
    }

    itemsRef.once('value', snapshot => {
      let updates = {};
      snapshot.forEach(child => {
        const item = child.val();
        const itemName = item.name ? item.name.toLowerCase() : '';
        const itemValue = item.value ? item.value.toString().toLowerCase() : '';

        if (itemName.includes(searchInput) || itemValue.includes(searchInput)) {
          updates[child.key + '/value'] = newValue;
        }
      });

      if (Object.keys(updates).length === 0) {
        alert('No matching items found for quick update.');
        return;
      }

      db.ref('items').update(updates, error => {
        if (error) {
          alert('Update failed: ' + error.message);
        } else {
          alert('Quick update successful!');
          refreshItemList(); // Refresh the UI
        }
      });
    });
  });

  // Add search input event listener
  document.getElementById('searchInput').addEventListener('input', refreshItemList);
}

function refreshItemList() {
  const db = firebase.database();
  const itemsRef = db.ref('items');
  const list = document.getElementById('itemList');
  const filter = document.getElementById('searchInput').value.toLowerCase();

  // Paging variables
  const itemsPerPage = 10;
  let currentPage = 1;
  let totalItems = 0;
  let filteredItems = [];

  // Clear the list and show loading state
  list.innerHTML = '<div style="text-align: center; padding: 20px; color: #ccc;">Loading items...</div>';

  itemsRef.once('value', snapshot => {
    // Reset paging variables
    currentPage = 1;
    filteredItems = [];
    totalItems = 0;

    // Filter items based on search input (search both name and value)
    snapshot.forEach(child => {
      const item = child.val();
      const itemName = item.name ? item.name.toLowerCase() : '';
      const itemValue = item.value ? item.value.toString().toLowerCase() : '';

      if (itemName.includes(filter) || itemValue.includes(filter)) {
        filteredItems.push({
          key: child.key,
          ...item
        });
      }
    });

    totalItems = filteredItems.length;

    // Display items for current page
    displayPageItems();
  });

  function displayPageItems() {
    list.innerHTML = '';

    if (filteredItems.length === 0) {
      list.innerHTML = '<div style="text-align: center; padding: 20px; color: #ccc;">No items found</div>';
      return;
    }

    // Calculate start and end index for current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredItems.length);

    // Display items for current page
    for (let i = startIndex; i < endIndex; i++) {
      const item = filteredItems[i];
      const div = document.createElement('div');
      div.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
        background: #2c2c2c;
        padding: 6px 10px;
        border-radius: 8px;
      `;

      div.innerHTML = `
        <input
          value="${item.name || ''}"
          data-key="${item.key}"
          style="
            flex: 0 0 45%;
            padding: 6px 8px;
            border-radius: 6px;
            border: none;
            outline-color: #5c5ca8;
            font-size: 14px;
            color: #222;
            background: #eee;
          "
        >
        <input
          value="${item.value || ''}"
          data-key="${item.key}"
          style="
            flex: 0 0 25%;
            padding: 6px 8px;
            border-radius: 6px;
            border: none;
            outline-color: #5c5ca8;
            font-size: 14px;
            color: #222;
            background: #eee;
          "
        >
        <button
          data-key="${item.key}"
          class="updateSingleBtn"
          style="
            flex: 0 0 15%;
            background: #5c5ca8;
            border: none;
            border-radius: 6px;
            color: white;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s ease;
            user-select: none;
          "
          title="Save"
        >💾</button>
        <button
          data-key="${item.key}"
          class="deleteSingleBtn"
          style="
            flex: 0 0 15%;
            background: #d9534f;
            border: none;
            border-radius: 6px;
            color: white;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s ease;
            user-select: none;
          "
          title="Delete"
        >❌</button>
      `;

      // Hover effect for buttons
      const updateBtn = div.querySelector('.updateSingleBtn');
      updateBtn.addEventListener('mouseenter', () => updateBtn.style.background = '#4848b0');
      updateBtn.addEventListener('mouseleave', () => updateBtn.style.background = '#5c5ca8');

      const deleteBtn = div.querySelector('.deleteSingleBtn');
      deleteBtn.addEventListener('mouseenter', () => deleteBtn.style.background = '#c9302c');
      deleteBtn.addEventListener('mouseleave', () => deleteBtn.style.background = '#d9534f');

      list.appendChild(div);
    }

    // Add pagination controls
    const paginationDiv = document.createElement('div');
    paginationDiv.style.cssText = `
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      margin-top: 15px;
      user-select: none;
    `;

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    paginationDiv.innerHTML = `
      <button id="prevPageBtn" style="
        background: ${currentPage === 1 ? '#555' : '#5c5ca8'};
        border: none;
        border-radius: 6px;
        color: white;
        padding: 6px 12px;
        cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'};
        transition: background 0.3s ease;
      " ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
      <span style="color: #eee;">Page ${currentPage} of ${totalPages}</span>
      <button id="nextPageBtn" style="
        background: ${currentPage === totalPages ? '#555' : '#5c5ca8'};
        border: none;
        border-radius: 6px;
        color: white;
        padding: 6px 12px;
        cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'};
        transition: background 0.3s ease;
      " ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
    `;

    // Add event listeners for pagination buttons
    const prevBtn = paginationDiv.querySelector('#prevPageBtn');
    const nextBtn = paginationDiv.querySelector('#nextPageBtn');

    if (prevBtn && currentPage > 1) {
      prevBtn.addEventListener('click', () => {
        currentPage--;
        displayPageItems();
      });
      prevBtn.addEventListener('mouseenter', () => {
        if (currentPage > 1) prevBtn.style.background = '#4848b0';
      });
      prevBtn.addEventListener('mouseleave', () => {
        if (currentPage > 1) prevBtn.style.background = '#5c5ca8';
      });
    }

    if (nextBtn && currentPage < totalPages) {
      nextBtn.addEventListener('click', () => {
        currentPage++;
        displayPageItems();
      });
      nextBtn.addEventListener('mouseenter', () => {
        if (currentPage < totalPages) nextBtn.style.background = '#4848b0';
      });
      nextBtn.addEventListener('mouseleave', () => {
        if (currentPage < totalPages) nextBtn.style.background = '#5c5ca8';
      });
    }

    list.appendChild(paginationDiv);

        // After all items are added
list.querySelectorAll('.updateSingleBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.getAttribute('data-key');
    const parent = btn.parentElement;
    const nameInput = parent.children[0];
    const valueInput = parent.children[1];
    const newName = nameInput.value.trim();
    const newValue = valueInput.value.trim();

    firebase.database().ref('items/' + key).update({
      name: newName,
      value: newValue
    }).then(() => {
      alert('Item updated!');
      refreshItemList();
    }).catch(error => {
      alert('Error updating item: ' + error.message);
    });
  });
});

list.querySelectorAll('.deleteSingleBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.getAttribute('data-key');
    if (confirm('Are you sure you want to delete this item?')) {
      firebase.database().ref('items/' + key).remove()
        .then(() => {
          alert('Item deleted!');
          refreshItemList();
        }).catch(error => {
          alert('Error deleting item: ' + error.message);
        });
    }
  });
});
  }
}

function createStartPanel() {
    const startPanel = document.createElement('div');
    startPanel.id = 'startPanel';
    startPanel.style = `
        position: fixed;
        top: 150px;
        left: 100px;
        width: 280px;
        min-width: 220px;
        max-width: 420px;
        min-height: 200px;
        background: #1e1e1e;
        color: white;
        border: 1px solid #555;
        padding: 12px;
        border-radius: 12px;
        font-family: Arial, sans-serif;
        z-index: 9999;
        display: none;
        cursor: move;
        resize: both;
        overflow: auto;
        box-sizing: border-box;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
        input {
    border: 1px solid #ccc;
    padding: 5px;
}

input:focus {
    outline: none;
}

input.error {
    border: 2px solid red;
}

    `;

    // Default Panel HTML with updated text sizes
    const defaultContent = `
        <div class="panel-header" style="position: relative; display: flex; flex-direction: column; align-items: center; margin-bottom: 10px;">
            <div id="updateNotice" style="font-size: 12px; font-weight: bold; color: yellow; display: none; margin-bottom: 5px; user-select: none;">⚠ UPDATE ⚠</div>
            <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button id="backFromStartBtn" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; user-select: none;">←</button>
                    <button id="toggleEyeBtn" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; user-select: none;">👁</button>
                </div>
                <div id="clockDisplay" style="font-size: 13px; color: #ccc; user-select: none;"></div>
                <button id="openSettingsBtn" title="Settings" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; user-select: none;">⚙️</button>
            </div>
            <div class="resize-handle" style="position: absolute; right: 0; bottom: -10px; width: 20px; height: 20px; cursor: se-resize; z-index: 10000;">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                    <path d="M20 20H0V0h20z" fill="none"/>
                    <path d="M8 16H4v-4l4 4zm4-4h-4v4l4-4zm4-4h-4v4l4-4z"/>
                </svg>
            </div>
        </div>
        <div style="margin-bottom: 10px;">
            <div style="font-size: 11px; color: #aaa; margin-bottom: 2px; user-select: none;">Detected Name:</div>
            <div id="detectedName" style="font-size: 13px; word-break: break-word; color: #ddd; padding: 4px 0;">No name detected</div>
        </div>
        <div style="margin-bottom: 10px;">
            <div style="font-size: 11px; color: #aaa; margin-bottom: 2px; user-select: none;">SKU Value:</div>
            <div id="skuValue" style="font-size: 13px; word-break: break-word; color: #ddd; padding: 4px 0;">No detected SKU</div>
        </div>
       <button id="copyBtn" style="width: 100%; background: #444; color: white; padding: 6px 10px; border: none; border-radius: 5px; font-size: 12px; cursor: pointer;margin-top: 6px; user-select: none;">
       Copy SKU
     </button>
    `;


const settingsContent = `
<div style="padding: 10px; color: #ccc; user-select: none;">
    <!-- Improved Panel Header with smaller title -->
    <div class="panel-header" style="display: flex; align-items: center; margin-bottom: 15px; gap: 8px; user-select: none;">
        <button id="backFromSettingsBtn" title="Back" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; flex-shrink: 0;">←</button>
        <h2 style="margin: 0; flex-grow: 1; border-bottom: 1px solid #444; padding-bottom: 8px; font-size: 16px; font-weight: 500; user-select: none;">Blinking Settings</h2>
        <div id="settingsClock" style="font-size: 13px; color: #ccc; flex-shrink: 0;"></div>
    </div>

    <!-- Blinking Effect Toggle -->
    <div style="margin-bottom: 20px; user-select: none;">
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="blinkEffectToggle" style="cursor: pointer; " ${localStorage.getItem('blinkEffectEnabled') === 'true' ? 'checked' : ''}>
            Enable reminder animation
        </label>
         <div style="margin-bottom: 20px;">
    <label for="blinkStyleSelect" style="display: block; margin-bottom: 5px;">Select Animation Effect:</label>
    <select id="blinkStyleSelect" style="width: 100%; padding: 5px; background: #333; color: #ccc; border: 1px solid #555;">
      <option value="blinkRedYellow">Red-Yellow Blink (Default)</option>
      <option value="RGBNeonFlicker">RGB Neon Flicker</option>
      <option value="pulseGlow">Pulse Glow</option>
      <option value="Heartbeat">Heartbeat Pulse</option>
      <option value="attentionSeeker">Pulse Shake</option>
      <option value="waveGlow">Wave Glow</option>
      <option value="breathingLight">Breathing Light</option>
    </select>
  </div>
    </div>

    <h3>Blinking Time Settings</h3>

    <!-- Add New Range Section -->
    <div style="margin: 15px 0; user-select: none;">
        <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 10px;">
            <span style="width: 50px;">From:</span>
            <input type="number" id="fromTime" min="0" max="59" placeholder="0"
                   style="width: 50px; padding: 3px; background: #333; color: #ccc; border: 1px solid #555;">
            <span>to</span>
            <input type="number" id="toTime" min="0" max="59" placeholder="59"
                   style="width: 50px; padding: 3px; background: #333; color: #ccc; border: 1px solid #555;">
            <button id="addRangeBtn" style="padding: 3px 8px; background: #555; color: #ccc; border: none; cursor: pointer;">Add</button>
        </div>
    </div>

    <!-- Saved Ranges Section -->
    <div style="margin: 20px 0; user-select: none;">
        <h4 style="margin-bottom: 10px; font-size: 14px;">Current Blinking Times:</h4>
        <div id="savedRangesContainer" style="border: 1px solid #444; padding: 10px; max-height: 200px; overflow-y: auto;">
            <!-- Dynamic content will appear here -->
        </div>
    </div>

    <button id="saveBlinkSettingsBtn" style="padding: 5px 15px; background: #4CAF50; color: white; border: none; cursor: pointer; margin-top: 10px; user-select: none;">Save All Changes</button>
</div>
`;
const style = document.createElement('style');
style.innerHTML = `
  @keyframes blinkRedYellow {
    0% { background-color: red; }
    50% { background-color: yellow; }
    100% { background-color: red; }
}
@keyframes RGBNeonFlicker {
    0%   { background-color: #ff0000; box-shadow: 0 0 5px #ff0000; }
    25%  { background-color: #00ff00; box-shadow: 0 0 10px #00ff00; }
    50%  { background-color: #0000ff; box-shadow: 0 0 15px #0000ff; }
    75%  { background-color: #ff00ff; box-shadow: 0 0 10px #ff00ff; }
    100% { background-color: #ff0000; box-shadow: 0 0 5px #ff0000; }
}
@keyframes pulseGlow {
    0% { box-shadow: 0 0 5px 2px rgba(255, 255, 0, 0.7); }
    50% { box-shadow: 0 0 20px 8px rgba(255, 255, 0, 1); }
    100% { box-shadow: 0 0 5px 2px rgba(255, 255, 0, 0.7); }
}
@keyframes Heartbeat {
    0%   { background-color: red; transform: scale(1); box-shadow: 0 0 5px red; }
    30%  { background-color: #ff6666; transform: scale(1.05); box-shadow: 0 0 15px #ff6666; }
    60%  { background-color: #ff0000; transform: scale(1.1); box-shadow: 0 0 20px red; }
    100% { background-color: red; transform: scale(1); box-shadow: 0 0 5px red; }
}
@keyframes attentionSeeker {
  0% { background-color: #ff0000; transform: scale(1) rotate(0deg); box-shadow: 0 0 5px #ff0000; filter: brightness(1); }
  20% { background-color: #ffcc00; transform: scale(1.05) rotate(-2deg); box-shadow: 0 0 15px #ffcc00; filter: brightness(1.2); }
  40% { background-color: #ff4400; transform: scale(0.95) rotate(2deg); box-shadow: 0 0 25px #ff4400; filter: brightness(1.1); }
  60% { background-color: #ffcc00; transform: scale(1.03) rotate(-1deg); box-shadow: 0 0 20px #ffcc00; filter: brightness(1.15); }
  80% { background-color: #ff0000; transform: scale(1.02) rotate(1deg); box-shadow: 0 0 30px #ff0000; filter: brightness(1.3); }
  100% { background-color: #ff0000; transform: scale(1) rotate(0deg); box-shadow: 0 0 5px #ff0000; filter: brightness(1); }
}

@keyframes waveGlow {
  0% { transform: translateY(0); box-shadow: 0 0 10px #ffa500; }
  50% { transform: translateY(-15px); box-shadow: 0 0 30px #ffa500; }
  100% { transform: translateY(0); box-shadow: 0 0 10px #ffa500; }
}

@keyframes breathingLight {
  0%   { transform: scale(1);     opacity: 1; }
  50%  { transform: scale(1.03);  opacity: 0.95; }
  100% { transform: scale(1);     opacity: 1; }
}


/* Apply the animation */
.attention-seeker {
  animation: attentionSeeker 1.5s infinite ease-in-out;
  border-radius: 8px;
  color: white;
  padding: 10px 20px;
  font-weight: bold;
  text-align: center;
  user-select: none;
}

    #startPanel::-webkit-resizer, #secondPanel::-webkit-resizer {
        background: transparent;
    }
    .resize-handle:hover {
        opacity: 0.8;
    }
    #startPanel, #secondPanel {
        transition: width 0.1s ease, height 0.1s ease;
    }
    #toggleEyeBtn:hover {
        transform: scale(1.2);
    }
    #deliverySearch:focus {
        outline: 1px solid #4CAF50;
    }
    #deliveryTableBody tr:hover {
        background: #555;
    }
`;

function checkTimeAndUpdatePanel() {
    const now = new Date();
    const minutes = now.getMinutes();
    const updateNotice = document.getElementById('updateNotice');
    const blinkEffectEnabled = localStorage.getItem('blinkEffectEnabled') === 'true';

    // Load saved ranges or use empty array if none
    const timeRanges = JSON.parse(localStorage.getItem('blinkTimeRanges')) || [];
    let isBlinkTime = false;

    // Check against all configured time ranges
    for (const range of timeRanges) {
        if (range.from <= range.to) {
            if (minutes >= range.from && minutes < range.to) {
                isBlinkTime = true;
                break;
            }
        } else {
            if (minutes >= range.from || minutes < range.to) {
                isBlinkTime = true;
                break;
            }
        }
    }

  const selectedStyle = localStorage.getItem('blinkStyle') || 'blinkRedYellow';

if (isBlinkTime) {
    updateNotice.style.display = 'block';
    if (blinkEffectEnabled) {
        startPanel.style.animation = `${selectedStyle} 1s infinite`;
    } else {
        startPanel.style.animation = 'none';
        startPanel.style.background = '#333';
    }
} else {
    startPanel.style.animation = 'none';
    startPanel.style.background = '#333';
    updateNotice.style.display = 'none';
}

}


document.head.appendChild(style);
// Update the initBlinkSettings function to properly initialize the checkbox
function initBlinkSettings() {
    // Load saved ranges or start with empty array
    window.blinkTimeRanges = JSON.parse(localStorage.getItem('blinkTimeRanges')) || [];
    updateSavedRangesDisplay();

    // Setup checkbox - default to true if not set
    const blinkToggle = document.getElementById('blinkEffectToggle');
if (blinkToggle) {
    // Default to FALSE if no value exists, otherwise use saved value
    blinkToggle.checked = localStorage.getItem('blinkEffectEnabled') === 'true';

    // Optional: Auto-save when toggled
    blinkToggle.addEventListener('change', function() {
        localStorage.setItem('blinkEffectEnabled', this.checked);
    });
     const blinkStyleSelect = document.getElementById('blinkStyleSelect');
    if (blinkStyleSelect) {
        const savedStyle = localStorage.getItem('blinkStyle') || 'blinkRedYellow'; // default
        blinkStyleSelect.value = savedStyle;
    }
}


    // Setup event listeners for the settings panel
    document.getElementById('addRangeBtn').addEventListener('click', addNewRange);
    document.getElementById('saveBlinkSettingsBtn').addEventListener('click', saveBlinkSettings);
}
function updateSavedRangesDisplay() {
    const container = document.getElementById('savedRangesContainer');

    if (!container) return; // Exit if container doesn't exist

    if (window.blinkTimeRanges.length === 0) {
        container.innerHTML = '<div style="color: #888; text-align: center;">No blinking times set yet</div>';
        return;
    }

    container.innerHTML = window.blinkTimeRanges.map((range, index) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px; margin: 3px 0; background: #222;">
            <span>${range.from} - ${range.to}</span>
            <button data-index="${index}" class="delete-range-btn" style="background: #f44336; color: white; border: none; padding: 2px 8px; cursor: pointer;">Delete</button>
        </div>
    `).join('');

    // Add event listeners to all delete buttons
    container.querySelectorAll('.delete-range-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            window.blinkTimeRanges.splice(index, 1);
            updateSavedRangesDisplay();
        });
    });
}


function addNewRange() {
    const fromInput = document.getElementById('fromTime');
    const toInput = document.getElementById('toTime');
    const from = parseInt(fromInput.value);
    const to = parseInt(toInput.value);

    // Reset styles first
    fromInput.style.border = '';
    toInput.style.border = '';

    if (isNaN(from) || isNaN(to)) {
        alert('Please enter valid minute values (0–59).');
        if (isNaN(from)) fromInput.style.border = '2px solid red';
        if (isNaN(to)) toInput.style.border = '2px solid red';
        return;
    }

    if (from < 0 || from > 59) {
        alert('Start minute must be between 0 and 59.');
        fromInput.style.border = '2px solid red';
        return;
    }

    if (to < 0 || to > 59) {
        alert('End minute must be between 0 and 59.');
        toInput.style.border = '2px solid red';
        return;
    }

    if (from === to) {
        alert('Invalid range: Start and end minutes cannot be the same (e.g. 25–25 is not allowed).');
        fromInput.style.border = '2px solid red';
        toInput.style.border = '2px solid red';
        return;
    }

    if (to < from) {
        alert('Invalid range: End minute must be greater than the start (e.g. 25–30 is okay, but 30–25 is not allowed).');
        fromInput.style.border = '2px solid red';
        toInput.style.border = '2px solid red';
        return;
    }

    // If all is good
    window.blinkTimeRanges.push({ from, to });
    updateSavedRangesDisplay();

    // Clear inputs and reset border
    fromInput.value = '';
    toInput.value = '';
    fromInput.style.border = '';
    toInput.style.border = '';
}



// Remove a range
function removeRange(index) {
    window.blinkTimeRanges.splice(index, 1);
    updateSavedRangesDisplay();
}

function saveBlinkSettings() {
    // Save the time ranges
    localStorage.setItem('blinkTimeRanges', JSON.stringify(window.blinkTimeRanges));

    // Save the checkbox state
    const blinkToggle = document.getElementById('blinkEffectToggle');
    if (blinkToggle) {
        localStorage.setItem('blinkEffectEnabled', blinkToggle.checked);
    }

    // Save the selected blinking style
    const blinkStyleSelect = document.getElementById('blinkStyleSelect');
    if (blinkStyleSelect) {
        localStorage.setItem('blinkStyle', blinkStyleSelect.value);
    }

    alert('Settings saved successfully!');
}







// Panel management functions
function showDefaultPanel() {
    startPanel.innerHTML = defaultContent;
    addEventListeners();
}

function showSettingsPanel() {
    startPanel.innerHTML = settingsContent;
    addEventListeners();
    initBlinkSettings(); // Initialize the settings when panel is shown
}

function addEventListeners() {
    const openSettingsBtn = document.getElementById('openSettingsBtn');
    if (openSettingsBtn) {
        openSettingsBtn.addEventListener('click', showSettingsPanel);
    }

    const backFromSettingsBtn = document.getElementById('backFromSettingsBtn');
    if (backFromSettingsBtn) {
        backFromSettingsBtn.addEventListener('click', showDefaultPanel);
    }

    const backFromStartBtn = document.getElementById('backFromStartBtn');
    if (backFromStartBtn) {
        backFromStartBtn.addEventListener('click', () => {
            if (detectionInterval) clearInterval(detectionInterval);
            if (clockInterval) clearInterval(clockInterval);
            if (currentSKUListener) {
                currentSKUListener.off();
                currentSKUListener = null;
            }
            hideElement(startPanel);
            showElement(document.getElementById('dashboard'));
        });
    }
}

// Initialize everything
startPanel.innerHTML = defaultContent;
document.body.appendChild(startPanel);
makeDraggable(startPanel);
addEventListeners();
setInterval(checkTimeAndUpdatePanel, 1000);


    // Add custom resize handle functionality
    const resizeHandle = startPanel.querySelector('.resize-handle');
    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    resizeHandle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(document.defaultView.getComputedStyle(startPanel).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(startPanel).height, 10);
        document.documentElement.style.cursor = 'se-resize';
        startPanel.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;

        const width = startWidth + e.clientX - startX;
        const height = startHeight + e.clientY - startY;

        startPanel.style.width = Math.max(200, Math.min(400, width)) + 'px';
        startPanel.style.height = Math.max(180, height) + 'px';
    });

    document.addEventListener('mouseup', function() {
        if (!isResizing) return;
        isResizing = false;
        document.documentElement.style.cursor = '';
        startPanel.style.userSelect = '';
    });

    // Panel functionality remains the same
    let currentSKUListener = null;

    document.getElementById('backFromStartBtn').addEventListener('click', () => {
        if (detectionInterval) clearInterval(detectionInterval);
        if (clockInterval) clearInterval(clockInterval);
        if (currentSKUListener) {
            currentSKUListener.off();
            currentSKUListener = null;
        }
        hideElement(startPanel);
        showElement(document.getElementById('dashboard'));
    });

let copyTimeout = null;

   function normalizeText(text) {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ñ/g, 'n')
        .replace(/-/g, ' ')
        .replace(/[().]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
   }


   function copySKU() {
    const skuValue = document.getElementById('skuValue').textContent;
    if (skuValue && skuValue !== "No detected SKU") {
        navigator.clipboard.writeText(skuValue)
            .then(() => {
                const copyBtn = document.getElementById('copyBtn');
                copyBtn.textContent = "Copied!";
                showToast(`✅ ${skuValue}`);  // Fixed: using ${skuValue} instead of $skuValue
                if (copyTimeout) clearTimeout(copyTimeout);  // clear previous timer
                copyTimeout = setTimeout(() => {
                    copyBtn.textContent = "Copy SKU";
                    copyTimeout = null;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                showToast(`❌ Failed to copy: ${err}`); // Optional: Add error toast
            });
    } else {
        showToast("⚠️ No SKU detected to copy"); // Optional: Add warning for no SKU
    }
}



    // Event listeners
   document.getElementById('copyBtn').addEventListener('click', copySKU);

document.addEventListener('keydown', (e) => {
    if (
        e.altKey &&        // Alt pressed
        !e.shiftKey &&     // Shift NOT pressed
        !e.ctrlKey &&      // Ctrl NOT pressed
        e.key.toLowerCase() === 'x'
    ) {
        e.preventDefault();
        copySKU();
    }
});


    function updateClock() {
        const now = new Date();
        const clock = document.getElementById('clockDisplay');
        clock.textContent = now.toLocaleTimeString();
    }

    const clockInterval = setInterval(updateClock, 1000);
    updateClock();


    // Create second panel function
function createSecondPanel() {
    const secondPanel = document.createElement('div');
    secondPanel.id = 'secondPanel';
    secondPanel.style = `
        position: fixed;
        top: 150px;
        left: 370px;
        width: 350px;
        min-width: 300px;
        max-width: 500px;
        min-height: 250px;
        background: #1e1e1e;
        color: white;
        border: 1px solid #555;
        padding: 12px;
        border-radius: 12px;
        font-family: Arial, sans-serif;
        z-index: 9998;
        display: none;
        cursor: move;
        resize: both;
        overflow: auto;
        box-sizing: border-box;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
    `;

    secondPanel.innerHTML = `
        <div class="panel-header" style="position: relative; display: flex; flex-direction: column; align-items: center; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                <div style="font-weight: bold; font-size: 15px;">📦 Delivery Information</div>
                <button id="closeSecondPanelBtn" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer;">✕</button>
            </div>
            <div class="resize-handle" style="position: absolute; right: 0; bottom: -10px; width: 20px; height: 20px; cursor: se-resize; z-index: 10000;">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                    <path d="M20 20H0V0h20z" fill="none"/>
                    <path d="M8 16H4v-4l4 4zm4-4h-4v4l4-4zm4-4h-4v4l4-4z"/>
                </svg>
            </div>
        </div>

        <div style="margin-bottom: 15px;">
            <input type="text" id="deliverySearch" placeholder="Search address..."
                   style="width: 100%; padding: 8px; border-radius: 6px; border: none; background: #2d2d2d; color: white; font-size: 13px;">
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; color: #ccc;">
            <div>Total: <span id="totalCount">0</span></div>
            <div>D2D: <span id="d2dCount">0</span></div>
            <div>NOD2D: <span id="nod2dCount">0</span></div>
        </div>

        <div style="overflow-y: auto; max-height: 300px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #333; position: sticky; top: 0;">
                        <th style="padding: 6px; text-align: left; border-bottom: 1px solid #555;">Address</th>
                        <th style="padding: 6px; text-align: center; border-bottom: 1px solid #555; width: 80px;">Type</th>
                        <th style="padding: 6px; text-align: center; border-bottom: 1px solid #555; width: 80px;">Days</th>
                    </tr>
                </thead>
                <tbody id="deliveryTableBody">
                    <!-- Search results here -->
                </tbody>
            </table>
        </div>
    `;
    document.body.appendChild(secondPanel);
    makeDraggable(secondPanel);

    // Resizing code (unchanged)
    const resizeHandle = secondPanel.querySelector('.resize-handle');
    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(getComputedStyle(secondPanel).width, 10);
        startHeight = parseInt(getComputedStyle(secondPanel).height, 10);
        document.documentElement.style.cursor = 'se-resize';
        secondPanel.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        secondPanel.style.width = Math.max(300, Math.min(500, startWidth + e.clientX - startX)) + 'px';
        secondPanel.style.height = Math.max(250, startHeight + e.clientY - startY) + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (!isResizing) return;
        isResizing = false;
        document.documentElement.style.cursor = '';
        secondPanel.style.userSelect = '';
    });

document.addEventListener('keydown', (e) => {
    if (
        e.altKey &&           // Alt must be pressed
        !e.shiftKey &&        // Shift must NOT be pressed
        !e.ctrlKey &&         // Ctrl must NOT be pressed
        e.key.toLowerCase() === 'z'
    ) {
        const panel = document.getElementById('secondPanel');
        const toggleBtn = document.getElementById('toggleEyeBtn');

        if (panel) {
            if (panel.style.display === 'none' || panel.style.display === '') {
                panel.style.display = 'block';
                if (toggleBtn) toggleBtn.textContent = '👁️‍🗨️'; // Optional icon change
            } else {
                panel.style.display = 'none';
                if (toggleBtn) toggleBtn.textContent = '👁';
            }
        }
    }
});



    document.getElementById('closeSecondPanelBtn').addEventListener('click', () => {
        secondPanel.style.display = 'none';
        document.getElementById('toggleEyeBtn').textContent = '👁';
    });

    let allData = [];

  function loadDeliveryDataOnce() {
    // Fetch location data from GitHub raw .txt
    fetch('https://raw.githubusercontent.com/papsikels/FORFUNSKU/refs/heads/main/LOCATION.txt')
        .then(response => response.text())
        .then(text => {
            // Split lines, trim empty lines
            const lines = text.trim().split('\n');

            // Map each line into an object with full_address and category (D2D or NOD2D)
            allData = lines.map(line => {
                // Example line: "Ilocos Norte Adams Adams (Pob.)	D2D"
                // Split by tab or multiple spaces
                let parts = line.trim().split(/\s+/);
                let category = parts.pop(); // last part is D2D or NOD2D
                let full_address = parts.join(' ');
                return { full_address, category };
            });

        })
        .catch(err => {
            console.error('Failed to load location data:', err);
        });
}

    // debounce helper function
    function debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }



function renderFilteredData(term = '') {
    const tableBody = document.getElementById('deliveryTableBody');
    tableBody.innerHTML = '';

    // Kapag walang laman ang search term, wag mag-display ng kahit ano, clear lang count
    if (term.trim() === '') {
        document.getElementById('totalCount').textContent = 0;
        document.getElementById('d2dCount').textContent = 0;
        document.getElementById('nod2dCount').textContent = 0;
        return;
    }

    const fragment = document.createDocumentFragment();

    let totalCount = 0;
    let d2dCount = 0;
    let nod2dCount = 0;

    const normalizedTerm = normalizeText(term);

    let displayedCount = 0;
    const maxDisplay = 100;

   for (let i = 0; i < allData.length; i++) {
    const item = allData[i];
    const address = item.full_address || '';
    let type = item.category || '';
    let days = getDeliveryDays(address);

    const normalizedAddress = normalizeText(address);
    const normalizedType = type.trim().toUpperCase();

    if (normalizedType === 'NOD2D') {
        days = '10-21 days';
    }

    if (normalizedAddress.includes(normalizedTerm)) {
        totalCount++;
        if (normalizedType === 'D2D') d2dCount++;
        if (normalizedType === 'NOD2D') nod2dCount++;

        if (displayedCount < maxDisplay) {
            const row = document.createElement('tr');
            const colorStyle = normalizedType === 'D2D' ? 'background: #006400; color: white;' :
                              normalizedType === 'NOD2D' ? 'background: #8B0000; color: white;' : '';

            row.innerHTML = `
                <td style="padding: 5px; border-bottom: 1px solid #777; ${colorStyle}">${address}</td>
                <td style="padding: 5px; text-align: center; border-bottom: 1px solid #777; ${colorStyle}">${type.toUpperCase()}</td>
                <td style="padding: 5px; text-align: center; border-bottom: 1px solid #777;">${days}</td>
            `;
            fragment.appendChild(row);
            displayedCount++;
        }
    }
}


    tableBody.appendChild(fragment);

    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('d2dCount').textContent = d2dCount;
    document.getElementById('nod2dCount').textContent = nod2dCount;
}





    // Debounced version of renderFilteredData
    const debouncedRender = debounce(renderFilteredData, 300);

    // Search listener with debounce
   document.getElementById('deliverySearch').addEventListener('input', (e) => {
    const value = e.target.value.trim();
    if (value.length > 0) {
        debouncedRender(value);
    } else {
        // Optional: clear table if walang search input
        document.getElementById('deliveryTableBody').innerHTML = '';
        document.getElementById('totalCount').textContent = '0';
        document.getElementById('d2dCount').textContent = '0';
        document.getElementById('nod2dCount').textContent = '0';
    }
});

    // Load once when panel becomes visible
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.attributeName === 'style' && secondPanel.style.display === 'block') {
                loadDeliveryDataOnce();
            }
        });
    });

    observer.observe(secondPanel, {
        attributes: true,
        attributeFilter: ['style']
    });
}


createSecondPanel();



function getDeliveryDays(address) {
    const lowerAddress = address.toLowerCase();

    // Combine all provinces with tag: Luzon/VisMin/Islands
    const provinceTags = [
        ...luzon.map(p => ({ name: p, region: '1-4 days' })),
        ...vismin.map(p => ({ name: p, region: '3-8 days' })),
        ...islands.map(p => ({ name: p, region: '10-21 days' })),
    ];

    let matched = null;
    let earliestIndex = Infinity;

    for (let { name, region } of provinceTags) {
        const index = lowerAddress.indexOf(name.toLowerCase());
        if (index !== -1 && index < earliestIndex) {
            matched = region;
            earliestIndex = index;
        }
    }

    return matched || 'N/A';
}





const luzon = [
  "Abra", "Albay", "Apayao", "Aurora", "Bataan", "Batangas", "Benguet", "Bulacan",
  "Cagayan", "Camarines Norte", "Camarines Sur", "Catanduanes", "Cavite", "Ifugao",
  "Ilocos Norte", "Ilocos Sur", "Isabela", "Kalinga", "La Union", "Laguna", "Metro Manila", "Marinduque",
  "Masbate", "Nueva Ecija", "Nueva Vizcaya", "Occidental Mindoro", "Oriental Mindoro",
  "Pampanga", "Pangasinan", "Quezon", "Quirino", "Rizal", "Sorsogon", "Tarlac", "Zambales"
];

const vismin = [
  "Agusan Del Norte", "Agusan Del Sur", "Aklan", "Antique", "Biliran", "Bukidnon", "Capiz",
  "Cebu", "Cotabato", "Davao De Oro", "Davao Del Norte", "Davao Del Sur", "Davao Occidental",
  "Davao Oriental", "Eastern Samar", "Guimaras", "Iloilo", "Lanao Del Norte", "Lanao Del Sur",
  "Leyte", "Maguindanao", "Misamis Occidental", "Misamis Oriental", "Negros Occidental",
  "Negros Oriental", "Northern Samar", "Romblon", "Southern Leyte", "Sultan Kudarat",
  "Surigao Del Norte", "Surigao Del Sur", "Western Samar", "Zamboanga Del Norte",
  "Zamboanga Del Sur", "Zamboanga Sibugay"
];

const islands = [
  "Basilan", "Batanes", "Bohol", "Camiguin", "Dinagat Islands", "Mountain Province",
  "Palawan", "Sarangani", "Siquijor", "South Cotabato", "Sulu", "Tawi Tawi"
];


document.addEventListener('keydown', async (e) => {
    if (e.altKey && e.key.toLowerCase() === 'a') {
        try {
            const tag = document.querySelector('.tag-combo');
            if (!tag) return;

            // Kunin ang buong voucher text (value)
            const value = tag.textContent.trim().split(':')[0]; // example: "3FlawlessCream=199"
            if (!value) return;

            // Kunin ang detected name sa page (halimbawa nasa #detectedName element)
            const detectedNameElement = document.getElementById('detectedName');
            if (!detectedNameElement) return;
            const name = detectedNameElement.textContent.trim();

            if (!name) {
                alert("No detected name found.");
                return;
            }

            const skuValueElement = document.getElementById('skuValue');

            const db = firebase.database();
            const itemsRef = db.ref('items');

            // Check kung may existing name na sa database
            const snapshot = await itemsRef.orderByChild('name').equalTo(name).once('value');

            if (snapshot.exists()) {
                // Name exists, huwag i-save ulit
                if (skuValueElement) {
                    const existingValue = Object.values(snapshot.val())[0].value;
                    skuValueElement.textContent = existingValue;
                }
                console.log(`"${name}" already exists in database. Skipping save.`);
                return;
            }

            // Save kung wala pang ganitong name
            await itemsRef.push({ name, value });
            if (skuValueElement) {
                skuValueElement.textContent = value;
            }
            alert(`✅ Saved: ${name} = ${value}`);

        } catch (error) {
            console.error("Auto-detect/save error:", error);
        }
    }
});


// Eye button toggle functionality
document.getElementById('toggleEyeBtn').addEventListener('click', () => {
    const secondPanel = document.getElementById('secondPanel');
    if (secondPanel.style.display === 'none' || !secondPanel.style.display) {
        secondPanel.style.display = 'block';
        document.getElementById('toggleEyeBtn').textContent = '👁️‍🗨';
    } else {
        secondPanel.style.display = 'none';
        document.getElementById('toggleEyeBtn').textContent = '👁';
    }
});


}

    function updateClock() {
        const clock = document.getElementById('clockDisplay');
        const now = new Date();
        clock.textContent = now.toLocaleTimeString();
    }



function detectAndDisplaySKU() {
    try {
        const startPanel = document.getElementById('startPanel');
        if (!startPanel || startPanel.style.display !== 'block') return;

        // First try method 1: From known span span
        let nameElements = document.querySelectorAll('.text-ellipsis.text-other-info span span');
        let detectedName = "No name detected";
        let found = false;

        nameElements.forEach(element => {
            if (element.textContent && element.textContent.trim()) {
                detectedName = element.textContent.trim();
                found = true;
            }
        });
        if (!found) {
            const replyBox = document.getElementById('replyBoxComposer');
            const placeholder = replyBox ? replyBox.placeholder.trim() : '';

            const match = placeholder.match(/Reply from\s+(.*)/i);
            if (match && match[1]) {
                detectedName = match[1].trim();
                console.log("Detected name:", detectedName);
                found = true;
            }
        }

        // If not found, try method 2: inside .avatar > div
        if (!found) {
            const avatarNameElements = document.querySelectorAll('.avatar > div:last-child');
            avatarNameElements.forEach(element => {
                if (element.textContent && element.textContent.trim()) {
                    detectedName = element.textContent.trim();
                    found = true;
                }
            });
        }

        // Update detected name in UI
        const detectedNameElement = document.getElementById('detectedName');
        if (detectedNameElement && detectedNameElement.textContent !== detectedName) {
            detectedNameElement.textContent = detectedName;
        }

        // Firebase check
        if (found) {
            const db = firebase.database();
            const itemsRef = db.ref('items');

            itemsRef.orderByChild('name').equalTo(detectedName).on('value', snapshot => {
                if (startPanel.style.display === 'block') {
                    const skuValueElement = document.getElementById('skuValue');
                    if (snapshot.exists()) {
                        let value = "No value found";
                        snapshot.forEach(child => {
                            value = child.val().value;
                        });
                        if (skuValueElement && skuValueElement.textContent !== value) {
                            skuValueElement.textContent = value;
                        }
                    } else {
                        if (skuValueElement && skuValueElement.textContent !== "No detected SKU") {
                            skuValueElement.textContent = "No detected SKU";
                        }
                    }
                }
            });
        } else {
            const skuValueElement = document.getElementById('skuValue');
            if (skuValueElement && skuValueElement.textContent !== "No detected SKU") {
                skuValueElement.textContent = "No detected SKU";
            }
        }
    } catch (error) {
        console.error("Detection error:", error);
    }
}

    loadFirebaseScripts(() => {
        waitForFirebase(() => {
            firebase.initializeApp(firebaseConfig);
            createDashboard();
            createAddItemForm();
            createUpdateForm();
            createStartPanel();
        });
    });

})();
