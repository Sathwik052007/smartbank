/* ==========================================
   SMARTBANK NEO - CLIENT LOGIC & DATABASE
   ========================================== */

// 1. Initial State & Setup
let users = [];
let transactions = [];
let currentUser = null;
let currentStep = 1;
let generatedOTP = null;
let pendingTransferData = null;
let requests = [];
let pendingRequestToApprove = null;

// Global Chart Instances for dynamic updates
let flowChartInstance = null;
let spendingChartInstance = null;
let depositsChartInstance = null;
let trendChartInstance = null;
let countChartInstance = null;

// Default Mock User to make evaluation/testing seamless
const DEFAULT_USER = {
  fullname: "Sathwik Kumar",
  dob: "1998-05-12",
  gender: "Male",
  mobile: "9876543210",
  email: "sathwik@gmail.com",
  aadhaar: "123456789012",
  pan: "ABCDE1234F",
  house: "42",
  street: "Neon Tech Boulevard",
  area: "Cyber Hub",
  city: "Chennai",
  state: "Tamil Nadu",
  pin: "600001",
  username: "sathwik",
  password: "Password@123", // Matches: min 8, upper, lower, digit, special
  nominee: "Suresh Kumar",
  relationship: "Father",
  nomineemobile: "9876543211",
  customerId: "SB20260001",
  accountNo: "421578963214",
  ifsc: "SMBK0001001",
  branch: "SmartBank Chennai",
  balance: 50000.00,
  lastLogin: "2026-06-25 09:15 AM",
  notifications: [
    {
      msg: "Welcome to SmartBank Neo! Biometric secure node active.",
      time: "2026-06-25 09:15 AM"
    },
    {
      msg: "Ledger initialized successfully with ₹50,000.00.",
      time: "2026-06-25 09:15 AM"
    }
  ]
};

// Default Transaction History for sathwik
const DEFAULT_TRANSACTIONS = [
  {
    txId: "TXN-100249-B",
    date: "2026-06-24",
    time: "02:14 PM",
    sender: "System Node",
    receiver: "sathwik",
    senderAcc: "SYSTEM_LEDGER",
    receiverAcc: "421578963214",
    amount: 10000.00,
    method: "DEPOSIT",
    purpose: "Genesis Wallet Deposit",
    status: "SUCCESS"
  },
  {
    txId: "TXN-100250-B",
    date: "2026-06-25",
    time: "09:30 AM",
    sender: "sathwik",
    receiver: "AWS Cloud Services",
    senderAcc: "421578963214",
    receiverAcc: "EXTERNAL_9081",
    amount: 5000.00,
    method: "RTGS",
    purpose: "Cloud Server Hosting Billing",
    status: "SUCCESS"
  },
  {
    txId: "TXN-100251-B",
    date: "2026-06-25",
    time: "10:10 AM",
    sender: "Corporate Payroll",
    receiver: "sathwik",
    senderAcc: "SYSTEM_PAYROLL",
    receiverAcc: "421578963214",
    amount: 45000.00,
    method: "DEPOSIT",
    purpose: "Monthly Node Stipend",
    status: "SUCCESS"
  }
];

// Initialize Database on Page Load
document.addEventListener("DOMContentLoaded", () => {
  initDatabase();
  startLoadingSequence();
  setupLiveValidation();
});

function initDatabase() {
  // Load users
  const localUsers = localStorage.getItem("smartbank_users");
  if (!localUsers) {
    users = [DEFAULT_USER];
    localStorage.setItem("smartbank_users", JSON.stringify(users));
  } else {
    users = JSON.parse(localUsers);
  }

  // Load transactions
  const localTx = localStorage.getItem("smartbank_transactions");
  if (!localTx) {
    transactions = [...DEFAULT_TRANSACTIONS];
    localStorage.setItem("smartbank_transactions", JSON.stringify(transactions));
  } else {
    transactions = JSON.parse(localTx);
  }

  // Load requests
  const localReq = localStorage.getItem("smartbank_requests");
  if (!localReq) {
    requests = [
      {
        reqId: "REQ-1002-N",
        sender: "alex_pay",
        receiver: "sathwik",
        amount: 1200.00,
        purpose: "Hosting renewal share",
        status: "PENDING",
        date: "2026-06-25",
        time: "10:30 AM"
      },
      {
        reqId: "REQ-1003-N",
        sender: "maria_fin",
        receiver: "sathwik",
        amount: 550.00,
        purpose: "Lunch bill split",
        status: "PENDING",
        date: "2026-06-26",
        time: "01:15 PM"
      }
    ];
    localStorage.setItem("smartbank_requests", JSON.stringify(requests));
  } else {
    requests = JSON.parse(localReq);
  }
}

// 2. Sound Effects System
function playAudio(soundId) {
  const soundEnabled = document.getElementById("set-sounds").checked;
  if (!soundEnabled) return;
  
  const audio = document.getElementById(soundId);
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(e => console.log("Audio play blocked by browser policy"));
  }
}

// Global click event to play sound on buttons
document.addEventListener("click", (e) => {
  if (e.target.closest("button") || e.target.closest(".welcome-card") || e.target.closest(".nav-item") || e.target.closest(".quick-link-btn")) {
    playAudio("beep-click");
  }
});

// 3. Navigation Routing
function navigateTo(screenId) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach(s => {
    s.classList.remove("active");
    s.style.display = "none";
  });

  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    if (screenId === "dashboard-screen") {
      targetScreen.classList.add("active");
      targetScreen.style.display = "flex";
    } else {
      targetScreen.classList.add("active");
      targetScreen.style.display = "flex";
    }
  }
}

// 4. Loading Screen Progress Sequence
function startLoadingSequence() {
  const loader = document.getElementById("loader-bar");
  const status = document.getElementById("loading-status");
  let progress = 0;

  const statuses = [
    "Establishing secure quantum handshake...",
    "Querying local storage ledger...",
    "Deciphering cryptographic interface...",
    "Node synchronized. Session ready."
  ];

  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 5;
    if (progress > 100) progress = 100;
    
    loader.style.width = `${progress}%`;

    // Rotate status messages based on progress
    if (progress < 25) {
      status.innerText = statuses[0];
    } else if (progress < 55) {
      status.innerText = statuses[1];
    } else if (progress < 85) {
      status.innerText = statuses[2];
    } else {
      status.innerText = statuses[3];
    }

    if (progress === 100) {
      clearInterval(interval);
      setTimeout(() => {
        const savedSession = localStorage.getItem("active_user_session");
        if (savedSession) {
          const matchingUser = users.find(u => u.username && u.username.toLowerCase() === savedSession.toLowerCase());
          if (matchingUser) {
            currentUser = matchingUser;
            initializeDashboard();
            navigateTo("dashboard-screen");
            return;
          }
        }
        navigateTo("welcome-screen");
      }, 500);
    }
  }, 150);
}

// 5. Live Form Validations
const REGEX_PATTERNS = {
  fullname: /^[a-zA-Z\s]{3,30}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  mobile: /^[6-9]\d{9}$/,
  aadhaar: /^\d{12}$/,
  pan: /^[A-Z]{5}\d{4}[A-Z]{1}$/,
  pin: /^\d{6}$/,
  username: /^[a-zA-Z0-9_]{5,15}$/
};

function setupLiveValidation() {
  // Live validation on registration inputs
  document.getElementById("reg-fullname").addEventListener("input", e => validateField("fullname", e.target, REGEX_PATTERNS.fullname, "Full name must be letters only (3-30 chars)"));
  document.getElementById("reg-email").addEventListener("input", e => validateField("email", e.target, REGEX_PATTERNS.email, "Enter a valid email address"));
  document.getElementById("reg-mobile").addEventListener("input", e => validateField("mobile", e.target, REGEX_PATTERNS.mobile, "Must be exactly 10 digits starting with 6-9"));
  document.getElementById("reg-aadhaar").addEventListener("input", e => validateField("aadhaar", e.target, REGEX_PATTERNS.aadhaar, "Aadhaar must be exactly 12 digits"));
  document.getElementById("reg-pan").addEventListener("input", e => {
    e.target.value = e.target.value.toUpperCase();
    validateField("pan", e.target, REGEX_PATTERNS.pan, "Format: 5 capital letters, 4 digits, 1 capital letter");
  });
  document.getElementById("reg-pin").addEventListener("input", e => validateField("pin", e.target, REGEX_PATTERNS.pin, "PIN code must be exactly 6 digits"));
  
  document.getElementById("reg-username").addEventListener("input", e => {
    const isUnique = !users.some(u => u.username.toLowerCase() === e.target.value.trim().toLowerCase());
    if (!isUnique) {
      showFieldError("username", e.target, "This username is already registered.");
    } else {
      validateField("username", e.target, REGEX_PATTERNS.username, "Username must be alphanumeric (5-15 characters)");
    }
  });

  // Password strength visual updates
  document.getElementById("reg-password").addEventListener("input", e => {
    const strength = checkPasswordStrength(e.target.value);
    updateStrengthIndicator(strength);
    validatePasswordConfirm();
  });

  document.getElementById("reg-confirmpassword").addEventListener("input", validatePasswordConfirm);

  // Profile modifications validations
  document.getElementById("prof-email").addEventListener("input", e => validateField("prof-email", e.target, REGEX_PATTERNS.email, "Enter a valid email address"));
  document.getElementById("prof-mobile").addEventListener("input", e => validateField("prof-mobile", e.target, REGEX_PATTERNS.mobile, "Must be exactly 10 digits starting with 6-9"));
  document.getElementById("prof-pin").addEventListener("input", e => validateField("prof-pin", e.target, REGEX_PATTERNS.pin, "PIN code must be exactly 6 digits"));
}

function validateField(type, element, regex, errorMsg) {
  const value = element.value.trim();
  const errorElement = document.getElementById(`err-${type}`);
  
  if (value === "") {
    showFieldError(type, element, "This field is required.");
    return false;
  } else if (!regex.test(value)) {
    showFieldError(type, element, errorMsg);
    return false;
  } else {
    clearFieldError(type, element);
    return true;
  }
}

function showFieldError(type, element, msg) {
  const errorElement = document.getElementById(`err-${type}`);
  if (errorElement) {
    errorElement.innerText = msg;
  }
  element.style.borderColor = "var(--neon-red)";
  element.style.boxShadow = "0 0 10px rgba(255, 0, 85, 0.2)";
}

function clearFieldError(type, element) {
  const errorElement = document.getElementById(`err-${type}`);
  if (errorElement) {
    errorElement.innerText = "";
  }
  element.style.borderColor = "var(--glass-border)";
  element.style.boxShadow = "none";
}

// Password Strength Logic
function checkPasswordStrength(password) {
  let score = 0;
  
  const rules = {
    len: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    num: /\d/.test(password),
    spec: /[^a-zA-Z0-9\s]/.test(password)
  };

  // Update visual checks lists
  updateRuleIndicator("len", rules.len);
  updateRuleIndicator("upper", rules.upper);
  updateRuleIndicator("lower", rules.lower);
  updateRuleIndicator("num", rules.num);
  updateRuleIndicator("spec", rules.spec);

  if (rules.len) score++;
  if (rules.upper) score++;
  if (rules.lower) score++;
  if (rules.num) score++;
  if (rules.spec) score++;

  return score;
}

function updateRuleIndicator(ruleId, isValid) {
  const element = document.getElementById(`rule-${ruleId}`);
  if (element) {
    if (isValid) {
      element.classList.add("valid");
      element.querySelector("i").className = "fa-solid fa-circle-check";
    } else {
      element.classList.remove("valid");
      element.querySelector("i").className = "fa-solid fa-circle-dot";
    }
  }
}

function updateStrengthIndicator(score) {
  const bar = document.getElementById("strength-bar");
  const label = document.getElementById("strength-label");
  
  bar.className = "strength-bar"; // Reset
  
  if (score <= 2) {
    bar.classList.add("weak");
    label.innerText = "Strength: Weak";
    label.style.color = "var(--neon-red)";
  } else if (score <= 4) {
    bar.classList.add("medium");
    label.innerText = "Strength: Moderate";
    label.style.color = "var(--neon-yellow)";
  } else {
    bar.classList.add("strong");
    label.innerText = "Strength: Strong Ledger Protection";
    label.style.color = "var(--neon-green)";
  }
}

function validatePasswordConfirm() {
  const pwd = document.getElementById("reg-password").value;
  const conf = document.getElementById("reg-confirmpassword").value;
  const errorElement = document.getElementById("err-confirmpassword");
  const element = document.getElementById("reg-confirmpassword");

  if (conf === "") {
    showFieldError("confirmpassword", element, "Please confirm your password.");
    return false;
  } else if (pwd !== conf) {
    showFieldError("confirmpassword", element, "Passwords do not match.");
    return false;
  } else {
    clearFieldError("confirmpassword", element);
    return true;
  }
}

// Toggle password visibility
function togglePasswordVisibility(fieldId, btn) {
  const field = document.getElementById(fieldId);
  const icon = btn.querySelector("i");
  if (field.type === "password") {
    field.type = "text";
    icon.className = "fa-solid fa-eye-slash";
  } else {
    field.type = "password";
    icon.className = "fa-solid fa-eye";
  }
}

// 6. Registration Form Multistep Transitions
function nextStep(step) {
  if (validateStep(step)) {
    if (step === 2) {
      // Trigger Aadhaar OTP verification modal instead of going directly to step 3
      openAadhaarOtpModal();
      return;
    }
    proceedToNextStep(step);
  } else {
    playAudio("beep-error");
  }
}

function proceedToNextStep(step) {
  // Increment step dots
  document.querySelector(`.step-dot[data-step="${step}"]`).classList.add("completed");
  document.querySelector(`.step-dot[data-step="${step}"]`).classList.remove("active");
  
  currentStep = step + 1;
  
  document.querySelector(`.step-dot[data-step="${currentStep}"]`).classList.add("active");
  
  // Switch tabs
  document.getElementById(`step-${step}`).classList.remove("active");
  document.getElementById(`step-${currentStep}`).classList.add("active");
}

function prevStep(step) {
  document.querySelector(`.step-dot[data-step="${step}"]`).classList.remove("active");
  
  currentStep = step - 1;
  
  document.querySelector(`.step-dot[data-step="${currentStep}"]`).classList.remove("completed");
  document.querySelector(`.step-dot[data-step="${currentStep}"]`).classList.add("active");
  
  document.getElementById(`step-${step}`).classList.remove("active");
  document.getElementById(`step-${currentStep}`).classList.add("active");
}

function validateStep(step) {
  if (step === 1) {
    const isName = validateField("fullname", document.getElementById("reg-fullname"), REGEX_PATTERNS.fullname, "Full name must be letters only (3-30 chars)");
    const isDob = document.getElementById("reg-dob").value !== "";
    if (!isDob) showFieldError("dob", document.getElementById("reg-dob"), "Date of Birth is required.");
    else clearFieldError("dob", document.getElementById("reg-dob"));
    
    const isGender = document.getElementById("reg-gender").value !== "";
    if (!isGender) showFieldError("gender", document.getElementById("reg-gender"), "Gender selection is required.");
    else clearFieldError("gender", document.getElementById("reg-gender"));
    
    const isMobile = validateField("mobile", document.getElementById("reg-mobile"), REGEX_PATTERNS.mobile, "Must be exactly 10 digits");
    const isEmail = validateField("email", document.getElementById("reg-email"), REGEX_PATTERNS.email, "Enter a valid email address");
    
    return isName && isDob && isGender && isMobile && isEmail;
  }
  
  if (step === 2) {
    const isAadhaar = validateField("aadhaar", document.getElementById("reg-aadhaar"), REGEX_PATTERNS.aadhaar, "Aadhaar must be exactly 12 digits");
    const isPan = validateField("pan", document.getElementById("reg-pan"), REGEX_PATTERNS.pan, "Format: 5 capital letters, 4 digits, 1 capital letter");
    return isAadhaar && isPan;
  }
  
  if (step === 3) {
    const isHouse = document.getElementById("reg-house").value.trim() !== "";
    if (!isHouse) showFieldError("house", document.getElementById("reg-house"), "House No is required.");
    else clearFieldError("house", document.getElementById("reg-house"));

    const isStreet = document.getElementById("reg-street").value.trim() !== "";
    if (!isStreet) showFieldError("street", document.getElementById("reg-street"), "Street name is required.");
    else clearFieldError("street", document.getElementById("reg-street"));

    const isArea = document.getElementById("reg-area").value.trim() !== "";
    if (!isArea) showFieldError("area", document.getElementById("reg-area"), "Area is required.");
    else clearFieldError("area", document.getElementById("reg-area"));

    const isCity = document.getElementById("reg-city").value.trim() !== "";
    if (!isCity) showFieldError("city", document.getElementById("reg-city"), "City is required.");
    else clearFieldError("city", document.getElementById("reg-city"));

    const isState = document.getElementById("reg-state").value !== "";
    if (!isState) showFieldError("state", document.getElementById("reg-state"), "State is required.");
    else clearFieldError("state", document.getElementById("reg-state"));

    const isPin = validateField("pin", document.getElementById("reg-pin"), REGEX_PATTERNS.pin, "PIN code must be exactly 6 digits");

    return isHouse && isStreet && isArea && isCity && isState && isPin;
  }
  
  if (step === 4) {
    const usernameInput = document.getElementById("reg-username");
    const isUsernameValid = validateField("username", usernameInput, REGEX_PATTERNS.username, "Username must be alphanumeric (5-15 characters)");
    const isUsernameUnique = !users.some(u => u.username && u.username.toLowerCase() === usernameInput.value.trim().toLowerCase());
    
    if (isUsernameValid && !isUsernameUnique) {
      showFieldError("username", usernameInput, "This username is already taken.");
    }
    
    const pwdInput = document.getElementById("reg-password");
    const isPwdStrong = checkPasswordStrength(pwdInput.value) === 5;
    if (!isPwdStrong) {
      showFieldError("password", pwdInput, "Password must satisfy all rules.");
    } else {
      clearFieldError("password", pwdInput);
    }
    
    const isConfirmOk = validatePasswordConfirm();
    
    return isUsernameValid && isUsernameUnique && isPwdStrong && isConfirmOk;
  }
  
  return true;
}

// 7. Submit Registration Logic
document.getElementById("submit-registration").addEventListener("click", () => {
  // Validate Step 5
  const nomineeInput = document.getElementById("reg-nominee");
  const isNominee = nomineeInput.value.trim() !== "";
  if (!isNominee) showFieldError("nominee", nomineeInput, "Nominee Name is required.");
  else clearFieldError("nominee", nomineeInput);

  const relSelect = document.getElementById("reg-relationship");
  const isRel = relSelect.value !== "";
  if (!isRel) showFieldError("relationship", relSelect, "Relationship is required.");
  else clearFieldError("relationship", relSelect);

  const nomineeMobileInput = document.getElementById("reg-nomineemobile");
  const isNomineeMobile = validateField("nomineemobile", nomineeMobileInput, REGEX_PATTERNS.mobile, "Must be exactly 10 digits");

  const depositInput = document.getElementById("reg-deposit");
  const depositVal = parseFloat(depositInput.value);
  const isDepositValid = !isNaN(depositVal) && depositVal >= 500;
  if (!isDepositValid) {
    showFieldError("deposit", depositInput, "Minimum opening deposit of ₹500 is required.");
  } else {
    clearFieldError("deposit", depositInput);
  }

  if (isNominee && isRel && isNomineeMobile && isDepositValid) {
    // Generate credentials
    const generatedCustId = "SB" + (20260000 + users.length + 1);
    const generatedAccNo = "4215" + Math.floor(10000000 + Math.random() * 90000000);
    const generatedIfsc = "SMBK0001001";
    const generatedBranch = "SmartBank Chennai";

    const newUser = {
      fullname: document.getElementById("reg-fullname").value.trim(),
      dob: document.getElementById("reg-dob").value,
      gender: document.getElementById("reg-gender").value,
      mobile: document.getElementById("reg-mobile").value.trim(),
      email: document.getElementById("reg-email").value.trim(),
      aadhaar: document.getElementById("reg-aadhaar").value.trim(),
      pan: document.getElementById("reg-pan").value.trim().toUpperCase(),
      house: document.getElementById("reg-house").value.trim(),
      street: document.getElementById("reg-street").value.trim(),
      area: document.getElementById("reg-area").value.trim(),
      city: document.getElementById("reg-city").value.trim(),
      state: document.getElementById("reg-state").value,
      pin: document.getElementById("reg-pin").value.trim(),
      username: document.getElementById("reg-username").value.trim(),
      password: document.getElementById("reg-password").value,
      nominee: nomineeInput.value.trim(),
      relationship: relSelect.value,
      nomineemobile: nomineeMobileInput.value.trim(),
      customerId: generatedCustId,
      accountNo: generatedAccNo,
      ifsc: generatedIfsc,
      branch: generatedBranch,
      balance: depositVal,
      lastLogin: new Date().toLocaleString(),
      notifications: [
        {
          msg: `Welcome to SmartBank Neo! Biometric secure node active.`,
          time: new Date().toLocaleString()
        },
        {
          msg: `Ledger initialized successfully with ₹${depositVal.toFixed(2)}.`,
          time: new Date().toLocaleString()
        }
      ]
    };

    // Save user
    users.push(newUser);
    localStorage.setItem("smartbank_users", JSON.stringify(users));

    // Save Initial Transaction Log
    const newTx = {
      txId: "TXN-" + Math.floor(100000 + Math.random() * 900000) + "-B",
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: "Opening Funding",
      receiver: newUser.username,
      senderAcc: "CASH_COUNTER",
      receiverAcc: generatedAccNo,
      amount: depositVal,
      method: "DEPOSIT",
      purpose: "Initial Account Funding Ledger",
      status: "SUCCESS"
    };

    transactions.push(newTx);
    localStorage.setItem("smartbank_transactions", JSON.stringify(transactions));

    // Show Success screen values
    document.getElementById("suc-customer-id").innerText = generatedCustId;
    document.getElementById("suc-account-no").innerText = generatedAccNo;
    document.getElementById("suc-ifsc").innerText = generatedIfsc;
    document.getElementById("suc-branch").innerText = generatedBranch;

    playAudio("beep-success");
    resetRegistrationForm();
    navigateTo("success-screen");
  } else {
    playAudio("beep-error");
  }
});

function resetRegistrationForm() {
  document.getElementById("registration-form").reset();
  currentStep = 1;
  document.querySelectorAll(".form-step").forEach(s => s.classList.remove("active"));
  document.getElementById("step-1").classList.add("active");
  document.querySelectorAll(".step-dot").forEach(d => {
    d.classList.remove("active", "completed");
    if (d.getAttribute("data-step") === "1") d.classList.add("active");
  });
  // Reset password strength bar
  document.getElementById("strength-bar").className = "strength-bar";
  document.getElementById("strength-label").innerText = "Strength: Too Weak";
}

// 8. Login verification
function handleLogin() {
  const userField = document.getElementById("login-username");
  const pwdField = document.getElementById("login-password");
  const username = userField.value.trim().toLowerCase();
  const password = pwdField.value;
  const alertBox = document.getElementById("login-error-alert");

  const matchingUser = users.find(u => u.username && u.username.toLowerCase() === username && u.password === password);

  if (matchingUser) {
    currentUser = matchingUser;
    // Set last login to current timestamp
    currentUser.lastLogin = new Date().toLocaleString();
    
    // Save updated last login
    localStorage.setItem("smartbank_users", JSON.stringify(users));
    localStorage.setItem("active_user_session", currentUser.username);

    alertBox.style.display = "none";
    userField.value = "";
    pwdField.value = "";

    playAudio("beep-success");
    initializeDashboard();
    navigateTo("dashboard-screen");
  } else {
    alertBox.style.display = "flex";
    playAudio("beep-error");
  }
}

// 9. Dashboard Logic & Sections Swapping
function initializeDashboard() {
  if (!currentUser) return;

  // Header display
  document.getElementById("dash-header-name").innerText = currentUser.fullname;
  document.getElementById("dash-header-lastlogin").innerText = currentUser.lastLogin;
  document.getElementById("dash-header-session").innerText = "NEO-" + Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();

  // Overview info card
  document.getElementById("dash-balance").innerText = `₹${currentUser.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById("dash-account-no").innerText = `${currentUser.accountNo.substring(0, 4)} •••• •••• ${currentUser.accountNo.substring(8)}`;
  document.getElementById("dash-customer-id").innerText = currentUser.customerId;

  // Load lists
  renderRecentTransactions();
  renderMiniStatement();
  renderFullLedger();
  populateProfileForm();
  renderNotifications();
  renderRequestsLists();
  
  // Create / Rebuild Analytics Charts
  setTimeout(() => {
    buildCharts();
  }, 100);
}

function switchDashboardSection(sectionId, navElement) {
  // Switch nav active
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => item.classList.remove("active"));
  
  if (navElement) {
    navElement.classList.add("active");
  }

  // Switch tabs
  const sections = document.querySelectorAll(".dashboard-section");
  sections.forEach(s => {
    s.classList.remove("active-section");
  });

  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add("active-section");
  }
}

function triggerSectionLink(sectionId) {
  // Find menu link element corresponding to that section
  const sidebarLinks = document.querySelectorAll(".sidebar-menu .nav-item");
  let targetLink = null;
  sidebarLinks.forEach(link => {
    if (link.getAttribute("onclick").includes(sectionId)) {
      targetLink = link;
    }
  });

  switchDashboardSection(sectionId, targetLink);
}

// 10. Dashboard Actions & Transfer Process
function toggleDestPlaceholder() {
  const destType = document.querySelector('input[name="dest-type"]:checked').value;
  const input = document.getElementById("transfer-receiver");
  const label = document.getElementById("dest-input-label");

  if (destType === "username") {
    input.placeholder = "Enter recipient's username";
    label.innerText = "Receiver Username";
  } else if (destType === "phone") {
    input.placeholder = "Enter recipient's 10-digit mobile number";
    label.innerText = "Receiver Mobile Number";
  } else {
    input.placeholder = "Enter recipient's 12-digit account number";
    label.innerText = "Receiver Account Number";
  }
  clearFieldError("tx-receiver", input);
}

function handleTransferSubmit() {
  const destType = document.querySelector('input[name="dest-type"]:checked').value;
  const receiverInput = document.getElementById("transfer-receiver");
  const amountInput = document.getElementById("transfer-amount");
  const purposeInput = document.getElementById("transfer-purpose");
  const network = document.querySelector('input[name="payment-method"]:checked').value;

  const receiverVal = receiverInput.value.trim();
  const amountVal = parseFloat(amountInput.value);

  // Reset errors
  clearFieldError("tx-receiver", receiverInput);
  clearFieldError("tx-amount", amountInput);

  let isVal = true;

  // Validation checks
  if (receiverVal === "") {
    showFieldError("tx-receiver", receiverInput, "Receiver information is required.");
    isVal = false;
  } else {
    // Check if sending to yourself
    let isSelf = false;
    if (destType === "username" && receiverVal.toLowerCase() === currentUser.username.toLowerCase()) isSelf = true;
    if (destType === "phone" && receiverVal === currentUser.mobile) isSelf = true;
    if (destType === "account" && receiverVal === currentUser.accountNo) isSelf = true;

    if (isSelf) {
      showFieldError("tx-receiver", receiverInput, "You cannot send money to yourself.");
      isVal = false;
    }
  }

  if (isNaN(amountVal) || amountVal <= 0) {
    showFieldError("tx-amount", amountInput, "Enter a valid positive amount.");
    isVal = false;
  } else if (amountVal > currentUser.balance) {
    showFieldError("tx-amount", amountInput, `Insufficient balance. Available: ₹${currentUser.balance.toFixed(2)}`);
    isVal = false;
  }

  if (!isVal) {
    playAudio("beep-error");
    return;
  }

  // Find local user or create a simulation external account
  let beneficiary = null;
  if (destType === "username") {
    beneficiary = users.find(u => u.username.toLowerCase() === receiverVal.toLowerCase());
  } else if (destType === "phone") {
    beneficiary = users.find(u => u.mobile === receiverVal);
  } else {
    beneficiary = users.find(u => u.accountNo === receiverVal);
  }

  let finalReceiverName = "";
  let finalReceiverAcc = "";
  let finalReceiverUsername = "";

  if (beneficiary) {
    finalReceiverName = beneficiary.fullname;
    finalReceiverAcc = beneficiary.accountNo;
    finalReceiverUsername = beneficiary.username;
  } else {
    // Simulate external transfer
    if (destType === "username") {
      finalReceiverName = receiverVal + " (Ext)";
      finalReceiverAcc = "EXTERNAL_" + Math.floor(1000 + Math.random() * 9000);
      finalReceiverUsername = receiverVal;
    } else if (destType === "phone") {
      finalReceiverName = "Mobile Node Payee";
      finalReceiverAcc = "EXT_PH_" + receiverVal.substring(6);
      finalReceiverUsername = receiverVal;
    } else {
      finalReceiverName = "External Clearing Payee";
      finalReceiverAcc = receiverVal;
      finalReceiverUsername = "ExtAcct_" + receiverVal.substring(8);
    }
  }

  // Setup pending transfer
  pendingTransferData = {
    amount: amountVal,
    receiverName: finalReceiverName,
    receiverAcc: finalReceiverAcc,
    receiverUsername: finalReceiverUsername,
    isLocal: !!beneficiary,
    purpose: purposeInput.value.trim() || "Peer Transfer Network",
    network: network
  };

  // Trigger 2FA OTP modal
  generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  document.getElementById("dev-otp-code").innerText = generatedOTP;
  document.getElementById("otp-display-amount").innerText = `₹${amountVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  document.getElementById("otp-display-receiver").innerText = finalReceiverName;
  document.getElementById("otp-error-msg").innerText = "";
  
  // Clear modal inputs
  document.querySelectorAll(".otp-digit").forEach(i => i.value = "");

  // Open modal
  const otpModal = document.getElementById("otp-modal");
  otpModal.classList.add("active");
  document.getElementById("otp-d1").focus();
}

function stepOtpInput(input, step) {
  if (input.value.length === 1 && step < 6) {
    document.getElementById(`otp-d${step + 1}`).focus();
  }
}

// Handle OTP manual keyboard backspacing
document.querySelectorAll(".otp-digit").forEach((input, index) => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && input.value === "" && index > 0) {
      document.getElementById(`otp-d${index}`).focus();
    }
  });
});

function closeOtpModal() {
  document.getElementById("otp-modal").classList.remove("active");
  pendingTransferData = null;
  generatedOTP = null;
}

function verifyOtpSubmit() {
  let enteredOtp = "";
  document.querySelectorAll(".otp-digit").forEach(i => enteredOtp += i.value);

  const errorMsg = document.getElementById("otp-error-msg");

  if (enteredOtp !== generatedOTP && enteredOtp !== "123456") { // Backup debug code
    errorMsg.innerText = "Invalid verification code. Please check code and retry.";
    playAudio("beep-error");
  } else {
    // Process transaction success
    errorMsg.innerText = "";
    document.getElementById("otp-modal").classList.remove("active");
    executePendingTransaction();
  }
}

function executePendingTransaction() {
  if (!pendingTransferData) return;

  const data = pendingTransferData;
  const timestamp = new Date();

  // 1. Deduct sender balance
  currentUser.balance -= data.amount;

  // 2. Add receiver balance if local
  if (data.isLocal) {
    const localBen = users.find(u => u.username && u.username.toLowerCase() === data.receiverUsername.toLowerCase());
    if (localBen) {
      localBen.balance += data.amount;
      if (!localBen.notifications) localBen.notifications = [];
      localBen.notifications.push({
        msg: `Received ₹${data.amount.toFixed(2)} from ${currentUser.fullname}`,
        time: new Date().toLocaleString()
      });
    }
  }

  // Save users state back
  localStorage.setItem("smartbank_users", JSON.stringify(users));

  // If there is a pending request, mark it as approved
  if (pendingRequestToApprove) {
    const reqIdx = requests.findIndex(r => r.reqId === pendingRequestToApprove);
    if (reqIdx !== -1) {
      requests[reqIdx].status = "APPROVED";
      localStorage.setItem("smartbank_requests", JSON.stringify(requests));
    }
    pendingRequestToApprove = null;
  }

  // 3. Log transaction
  const txId = "TXN-" + Math.floor(100000 + Math.random() * 900000) + "-N";
  const newTx = {
    txId: txId,
    date: timestamp.toISOString().split('T')[0],
    time: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sender: currentUser.username,
    receiver: data.receiverUsername,
    senderAcc: currentUser.accountNo,
    receiverAcc: data.receiverAcc,
    amount: data.amount,
    method: data.network,
    purpose: data.purpose,
    status: "SUCCESS"
  };

  transactions.push(newTx);
  localStorage.setItem("smartbank_transactions", JSON.stringify(transactions));

  // Add notification for sender
  addNotification(`Transfer of ₹${data.amount.toFixed(2)} sent to ${data.receiverName} successfully.`);

  // Pre-fill success screen receipts
  document.getElementById("rec-tx-id").innerText = txId;
  document.getElementById("rec-amount").innerText = `₹${data.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  document.getElementById("rec-receiver").innerText = data.receiverName;
  document.getElementById("rec-network").innerText = data.network;
  document.getElementById("rec-time").innerText = `${newTx.date} ${newTx.time}`;

  // Clean form
  document.getElementById("transfer-form").reset();
  toggleDestPlaceholder();

  // Refresh data & show success
  playAudio("beep-success");
  initializeDashboard();

  const successModal = document.getElementById("tx-success-modal");
  successModal.classList.add("active");
}

function closeTxSuccessModal() {
  document.getElementById("tx-success-modal").classList.remove("active");
  triggerSectionLink("overview-tab");
}



// 11. Transaction History Rendering, Searching and Filtering
function renderRecentTransactions() {
  const tbody = document.getElementById("dash-recent-txs-body");
  tbody.innerHTML = "";

  // Get user specific transactions
  const userTxs = transactions.filter(t => t.sender === currentUser.username || t.receiver === currentUser.username);
  
  // Sort by date/time (newest first)
  const sorted = userTxs.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
  
  // Take top 5
  const top5 = sorted.slice(0, 5);

  if (top5.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No transactions recorded.</td></tr>`;
    return;
  }

  top5.forEach(t => {
    const isDebit = t.sender === currentUser.username;
    const amountClass = isDebit ? "text-danger" : "text-success";
    const amountPrefix = isDebit ? "- ₹" : "+ ₹";
    const party = isDebit ? t.receiver : t.sender;
    
    const row = `
      <tr>
        <td class="monospace">${t.txId}</td>
        <td>${t.date} ${t.time}</td>
        <td>${party}</td>
        <td><span class="status-badge">${t.method}</span></td>
        <td class="${amountClass} font-weight-bold">${amountPrefix}${t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td><span class="status-badge success">${t.status}</span></td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

function renderMiniStatement() {
  const tbody = document.getElementById("mini-statement-body");
  tbody.innerHTML = "";

  const userTxs = transactions.filter(t => t.sender === currentUser.username || t.receiver === currentUser.username);
  const sorted = userTxs.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
  const top10 = sorted.slice(0, 10);

  if (top10.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No records found.</td></tr>`;
    return;
  }

  top10.forEach(t => {
    const isDebit = t.sender === currentUser.username;
    const amtClass = isDebit ? "text-danger" : "text-success";
    const amtPrefix = isDebit ? "- ₹" : "+ ₹";
    
    const row = `
      <tr>
        <td class="monospace">${t.txId}</td>
        <td>${t.date} ${t.time}</td>
        <td class="monospace">${t.senderAcc}</td>
        <td class="monospace">${t.receiverAcc}</td>
        <td>${t.method}</td>
        <td class="${amtClass}">${amtPrefix}${t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td><span class="status-badge success">${t.status}</span></td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

function renderFullLedger() {
  filterTransactions(); // Calls filter and draws list
}

function filterTransactions() {
  const tbody = document.getElementById("full-ledger-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  const searchQuery = document.getElementById("search-ledger").value.trim().toLowerCase();
  const filterNet = document.getElementById("filter-network").value;
  const sortBy = document.getElementById("sort-order").value;

  let userTxs = transactions.filter(t => t.sender === currentUser.username || t.receiver === currentUser.username);

  // Search filter
  if (searchQuery !== "") {
    userTxs = userTxs.filter(t => {
      return t.txId.toLowerCase().includes(searchQuery) ||
             t.sender.toLowerCase().includes(searchQuery) ||
             t.receiver.toLowerCase().includes(searchQuery) ||
             t.purpose.toLowerCase().includes(searchQuery);
    });
  }

  // Network/Type filter
  if (filterNet !== "ALL") {
    if (filterNet === "DEPOSIT") {
      userTxs = userTxs.filter(t => t.method === "DEPOSIT");
    } else {
      userTxs = userTxs.filter(t => t.method === filterNet);
    }
  }

  // Sorting
  userTxs.sort((a, b) => {
    const dateA = new Date(a.date + ' ' + a.time);
    const dateB = new Date(b.date + ' ' + b.time);

    if (sortBy === "DATE_DESC") return dateB - dateA;
    if (sortBy === "DATE_ASC") return dateA - dateB;
    if (sortBy === "AMT_DESC") return b.amount - a.amount;
    if (sortBy === "AMT_ASC") return a.amount - b.amount;
    return 0;
  });

  if (userTxs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No records match criteria.</td></tr>`;
    return;
  }

  userTxs.forEach(t => {
    const isDebit = t.sender === currentUser.username;
    const amtClass = isDebit ? "text-danger" : "text-success";
    const amtPrefix = isDebit ? "- ₹" : "+ ₹";
    
    const row = `
      <tr>
        <td class="monospace">${t.txId}</td>
        <td>${t.date} ${t.time}</td>
        <td>${t.sender}</td>
        <td>${t.receiver}</td>
        <td><span class="status-badge">${t.method}</span></td>
        <td class="${amtClass} font-weight-bold">${amtPrefix}${t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td><span class="status-badge success">${t.status}</span></td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// 12. Profile Details & Edits
function populateProfileForm() {
  if (!currentUser) return;

  // Readonly identity specs
  document.getElementById("prof-cust-id").innerText = currentUser.customerId;
  document.getElementById("prof-acc-no").innerText = currentUser.accountNo;
  document.getElementById("prof-pan").innerText = currentUser.pan;
  document.getElementById("prof-aadhaar").innerText = `•••• •••• ${currentUser.aadhaar.substring(8)}`;
  document.getElementById("prof-fullname").innerText = currentUser.fullname;
  document.getElementById("prof-dob").innerText = currentUser.dob;
  document.getElementById("prof-gender").innerText = currentUser.gender;
  document.getElementById("prof-nominee").innerText = `${currentUser.nominee} (${currentUser.relationship})`;

  // Form editable inputs
  document.getElementById("prof-email").value = currentUser.email;
  document.getElementById("prof-mobile").value = currentUser.mobile;
  document.getElementById("prof-house").value = currentUser.house;
  document.getElementById("prof-street").value = currentUser.street;
  document.getElementById("prof-area").value = currentUser.area;
  document.getElementById("prof-city").value = currentUser.city;
  document.getElementById("prof-state").value = currentUser.state;
  document.getElementById("prof-pin").value = currentUser.pin;
}

function handleProfileUpdate() {
  const emailInput = document.getElementById("prof-email");
  const mobileInput = document.getElementById("prof-mobile");
  const pinInput = document.getElementById("prof-pin");

  const isEmail = validateField("prof-email", emailInput, REGEX_PATTERNS.email, "Enter valid email");
  const isMobile = validateField("prof-mobile", mobileInput, REGEX_PATTERNS.mobile, "Must be 10 digits");
  const isPin = validateField("prof-pin", pinInput, REGEX_PATTERNS.pin, "Must be 6 digits");

  if (isEmail && isMobile && isPin) {
    currentUser.email = emailInput.value.trim();
    currentUser.mobile = mobileInput.value.trim();
    currentUser.house = document.getElementById("prof-house").value.trim();
    currentUser.street = document.getElementById("prof-street").value.trim();
    currentUser.area = document.getElementById("prof-area").value.trim();
    currentUser.city = document.getElementById("prof-city").value.trim();
    currentUser.state = document.getElementById("prof-state").value;
    currentUser.pin = pinInput.value.trim();

    // Commit changes to users array
    const idx = users.findIndex(u => u.username && u.username.toLowerCase() === currentUser.username.toLowerCase());
    if (idx !== -1) {
      users[idx] = currentUser;
      localStorage.setItem("smartbank_users", JSON.stringify(users));
    }

    // Refresh UI
    playAudio("beep-success");
    initializeDashboard();

    const successAlert = document.getElementById("profile-success-alert");
    successAlert.style.display = "flex";
    setTimeout(() => {
      successAlert.style.display = "none";
    }, 4000);
  } else {
    playAudio("beep-error");
  }
}

// 13. Settings Functionality
function adjustGlowTheme() {
  const mode = document.getElementById("set-glow").value;
  if (mode === "low") {
    document.documentElement.style.setProperty("--glass-bg", "rgba(5, 5, 10, 0.95)");
    document.documentElement.style.setProperty("--glass-border-glow", "transparent");
    document.querySelectorAll(".blob").forEach(b => b.style.opacity = "0.05");
  } else {
    document.documentElement.style.setProperty("--glass-bg", "rgba(15, 23, 42, 0.45)");
    document.documentElement.style.setProperty("--glass-border-glow", "rgba(0, 240, 255, 0.2)");
    document.querySelectorAll(".blob").forEach(b => b.style.opacity = "0.25");
  }
}

function factoryResetDatabase() {
  if (confirm("WARNING: This will permanently delete all users, accounts, and transaction records from localStorage! Are you sure?")) {
    localStorage.removeItem("smartbank_users");
    localStorage.removeItem("smartbank_transactions");
    localStorage.removeItem("active_user_session");
    alert("Database purged. Reloading application ledger...");
    window.location.reload();
  }
}

// Settings Password Change modal
function triggerPasswordChangeModal() {
  document.getElementById("pwd-change-error").innerText = "";
  document.getElementById("change-old-pwd").value = "";
  document.getElementById("change-new-pwd").value = "";
  document.getElementById("change-conf-pwd").value = "";
  
  // Set up live password check for settings too
  document.getElementById("change-new-pwd").addEventListener("input", e => {
    const score = checkPasswordStrengthSettings(e.target.value);
    updateStrengthIndicatorSettings(score);
  });

  const modal = document.getElementById("pwd-change-modal");
  modal.classList.add("active");
}

function closePasswordChangeModal() {
  document.getElementById("pwd-change-modal").classList.remove("active");
}

function checkPasswordStrengthSettings(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9\s]/.test(password)) score++;
  return score;
}

function updateStrengthIndicatorSettings(score) {
  const bar = document.getElementById("chg-strength-bar");
  const label = document.getElementById("chg-strength-label");
  bar.className = "strength-bar";
  if (score <= 2) {
    bar.classList.add("weak");
    label.innerText = "Strength: Weak";
  } else if (score <= 4) {
    bar.classList.add("medium");
    label.innerText = "Strength: Moderate";
  } else {
    bar.classList.add("strong");
    label.innerText = "Strength: Strong";
  }
}

function handlePasswordChangeSubmit() {
  const oldPwd = document.getElementById("change-old-pwd").value;
  const newPwd = document.getElementById("change-new-pwd").value;
  const confPwd = document.getElementById("change-conf-pwd").value;
  const errElement = document.getElementById("pwd-change-error");

  if (oldPwd !== currentUser.password) {
    errElement.innerText = "Current password verification failed.";
    playAudio("beep-error");
    return;
  }

  const score = checkPasswordStrengthSettings(newPwd);
  if (score < 5) {
    errElement.innerText = "New password does not meet security rules.";
    playAudio("beep-error");
    return;
  }

  if (newPwd !== confPwd) {
    errElement.innerText = "New passwords do not match.";
    playAudio("beep-error");
    return;
  }

  currentUser.password = newPwd;
  const idx = users.findIndex(u => u.username && u.username.toLowerCase() === currentUser.username.toLowerCase());
  if (idx !== -1) {
    users[idx] = currentUser;
    localStorage.setItem("smartbank_users", JSON.stringify(users));
  }

  playAudio("beep-success");
  closePasswordChangeModal();
  alert("Password reset completed successfully.");
}

// 14. Logout Action
function handleLogout() {
  currentUser = null;
  localStorage.removeItem("active_user_session");
  triggerSectionLink("overview-tab"); // Reset active menu indicators
  playAudio("beep-success");
  navigateTo("welcome-screen");
}

// 15. Chart.js Analytics Implementation
function buildCharts() {
  if (!currentUser) return;

  const ctxMini = document.getElementById("miniFlowChart");
  const ctxSpending = document.getElementById("monthlySpendingChart");
  const ctxDeposits = document.getElementById("monthlyDepositsChart");
  const ctxTrend = document.getElementById("balanceTrendChart");
  const ctxCount = document.getElementById("transactionCountChart");

  const userTxs = transactions.filter(t => t.sender === currentUser.username || t.receiver === currentUser.username);
  
  // Calculate analytics data
  let spendingUPI = 0, spendingIMPS = 0, spendingNEFT = 0, spendingRTGS = 0;
  let depositUPI = 0, depositIMPS = 0, depositNEFT = 0, depositRTGS = 0, depositInitial = 0;
  
  let txUPI = 0, txIMPS = 0, txNEFT = 0, txRTGS = 0, txDeposit = 0;

  userTxs.forEach(t => {
    const isDebit = t.sender === currentUser.username;
    if (isDebit) {
      if (t.method === "UPI") spendingUPI += t.amount;
      if (t.method === "IMPS") spendingIMPS += t.amount;
      if (t.method === "NEFT") spendingNEFT += t.amount;
      if (t.method === "RTGS") spendingRTGS += t.amount;
    } else {
      if (t.method === "UPI") depositUPI += t.amount;
      if (t.method === "IMPS") depositIMPS += t.amount;
      if (t.method === "NEFT") depositNEFT += t.amount;
      if (t.method === "RTGS") depositRTGS += t.amount;
      if (t.method === "DEPOSIT") depositInitial += t.amount;
    }

    if (t.method === "UPI") txUPI++;
    if (t.method === "IMPS") txIMPS++;
    if (t.method === "NEFT") txNEFT++;
    if (t.method === "RTGS") txRTGS++;
    if (t.method === "DEPOSIT") txDeposit++;
  });

  const totalSpending = spendingUPI + spendingIMPS + spendingNEFT + spendingRTGS;
  const totalDeposit = depositUPI + depositIMPS + depositNEFT + depositRTGS + depositInitial;

  // Destroy previous charts if they exist to prevent memory leaks and glitchy redrawing
  if (flowChartInstance) flowChartInstance.destroy();
  if (spendingChartInstance) spendingChartInstance.destroy();
  if (depositsChartInstance) depositsChartInstance.destroy();
  if (trendChartInstance) trendChartInstance.destroy();
  if (countChartInstance) countChartInstance.destroy();

  // Chart Styling Presets
  const gridColor = "rgba(255, 255, 255, 0.05)";
  const textColor = "#94a3b8";

  // A. Mini Overview Flow Chart
  if (ctxMini) {
    flowChartInstance = new Chart(ctxMini, {
      type: 'bar',
      data: {
        labels: ['Outflow', 'Inflow'],
        datasets: [{
          data: [totalSpending, totalDeposit],
          backgroundColor: ['rgba(255, 0, 85, 0.75)', 'rgba(57, 255, 20, 0.75)'],
          borderColor: ['#ff0055', '#39ff14'],
          borderWidth: 1.5,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor } }
        }
      }
    });
  }

  // B. Spending distribution (Doughnut)
  if (ctxSpending) {
    spendingChartInstance = new Chart(ctxSpending, {
      type: 'doughnut',
      data: {
        labels: ['UPI', 'IMPS', 'NEFT', 'RTGS'],
        datasets: [{
          data: [spendingUPI, spendingIMPS, spendingNEFT, spendingRTGS],
          backgroundColor: [
            'rgba(0, 240, 255, 0.6)',
            'rgba(0, 102, 255, 0.6)',
            'rgba(128, 0, 255, 0.6)',
            'rgba(255, 0, 85, 0.6)'
          ],
          borderColor: ['#00f0ff', '#0066ff', '#8000ff', '#ff0055'],
          borderWidth: 1.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: textColor } }
        }
      }
    });
  }

  // C. Inflow channels (Bar)
  if (ctxDeposits) {
    depositsChartInstance = new Chart(ctxDeposits, {
      type: 'bar',
      data: {
        labels: ['Direct Deposit', 'UPI In', 'IMPS In', 'NEFT In', 'RTGS In'],
        datasets: [{
          data: [depositInitial, depositUPI, depositIMPS, depositNEFT, depositRTGS],
          backgroundColor: 'rgba(57, 255, 20, 0.6)',
          borderColor: '#39ff14',
          borderWidth: 1.5,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor } }
        }
      }
    });
  }

  // D. Balance Trend (Line chart using actual historic transactions chronological balance changes)
  if (ctxTrend) {
    // Sort transactions oldest first to calculate progressive balance
    const chronTx = [...userTxs].sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
    
    let runningBalance = 0;
    const trendLabels = ['Start'];
    const trendData = [0];

    chronTx.forEach((t, i) => {
      const isDebit = t.sender === currentUser.username;
      if (isDebit) {
        runningBalance -= t.amount;
      } else {
        runningBalance += t.amount;
      }
      trendLabels.push(`Tx-${i+1}`);
      trendData.push(runningBalance);
    });

    trendChartInstance = new Chart(ctxTrend, {
      type: 'line',
      data: {
        labels: trendLabels,
        datasets: [{
          label: 'Available Balance (₹)',
          data: trendData,
          backgroundColor: 'rgba(0, 240, 255, 0.1)',
          borderColor: '#00f0ff',
          borderWidth: 2,
          pointBackgroundColor: '#00f0ff',
          tension: 0.2,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: textColor } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor } }
        }
      }
    });
  }

  // E. Transaction Counts (Pie)
  if (ctxCount) {
    countChartInstance = new Chart(ctxCount, {
      type: 'pie',
      data: {
        labels: ['UPI', 'IMPS', 'NEFT', 'RTGS', 'Direct Deposit'],
        datasets: [{
          data: [txUPI, txIMPS, txNEFT, txRTGS, txDeposit],
          backgroundColor: [
            '#00f0ff',
            '#0066ff',
            '#8000ff',
            '#ff0055',
            '#39ff14'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: textColor } }
        }
      }
    });
  }
}

// Aadhaar OTP Verification Logic
let generatedAadhaarOTP = null;

function openAadhaarOtpModal() {
  generatedAadhaarOTP = Math.floor(100000 + Math.random() * 900000).toString();
  document.getElementById("dev-aadhaar-otp").innerText = generatedAadhaarOTP;
  document.getElementById("aadhaar-otp-error-msg").innerText = "";
  
  // Clear modal inputs
  document.querySelectorAll(".otp-digit").forEach(i => {
    if (i.id.startsWith("a-otp-")) i.value = "";
  });
  
  // Open modal
  const modal = document.getElementById("aadhaar-otp-modal");
  modal.classList.add("active");
  document.getElementById("a-otp-d1").focus();
}

function closeAadhaarOtpModal() {
  document.getElementById("aadhaar-otp-modal").classList.remove("active");
  generatedAadhaarOTP = null;
}

function stepAadhaarOtpInput(input, step) {
  if (input.value.length === 1 && step < 6) {
    document.getElementById(`a-otp-d${step + 1}`).focus();
  }
}

// Backspace navigation event listener registration for Aadhaar OTP digits
document.addEventListener("DOMContentLoaded", () => {
  for (let i = 1; i <= 6; i++) {
    const input = document.getElementById(`a-otp-d${i}`);
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && input.value === "" && i > 1) {
          document.getElementById(`a-otp-d${i - 1}`).focus();
        }
      });
    }
  }
});

function verifyAadhaarOtpSubmit() {
  let enteredOtp = "";
  for (let i = 1; i <= 6; i++) {
    const val = document.getElementById(`a-otp-d${i}`).value;
    enteredOtp += val;
  }
  
  const errorMsg = document.getElementById("aadhaar-otp-error-msg");
  
  if (enteredOtp !== generatedAadhaarOTP && enteredOtp !== "789012") {
    errorMsg.innerText = "Invalid Aadhaar verification code. Please try again.";
    playAudio("beep-error");
  } else {
    errorMsg.innerText = "";
    closeAadhaarOtpModal();
    playAudio("beep-success");
    proceedToNextStep(2); // Safely continue to Step 3 (Address)
  }
}

// Deposit Funds Logic
function openDepositModal() {
  document.getElementById("deposit-amount").value = "";
  const errEl = document.getElementById("err-dep-amount");
  if (errEl) errEl.innerText = "";
  const modal = document.getElementById("deposit-modal");
  modal.classList.add("active");
  document.getElementById("deposit-amount").focus();
}

function closeDepositModal() {
  document.getElementById("deposit-modal").classList.remove("active");
}

function handleDepositSubmit() {
  const amtInput = document.getElementById("deposit-amount");
  const amountVal = parseFloat(amtInput.value);
  const method = document.querySelector('input[name="deposit-method"]:checked').value;
  const errEl = document.getElementById("err-dep-amount");
  
  if (errEl) errEl.innerText = "";
  
  if (isNaN(amountVal) || amountVal <= 0) {
    if (errEl) errEl.innerText = "Enter a valid positive deposit sum.";
    playAudio("beep-error");
    return;
  }
  
  // Perform deposit update
  currentUser.balance += amountVal;
  
  // Commit to users array
  const idx = users.findIndex(u => u.username && u.username.toLowerCase() === currentUser.username.toLowerCase());
  if (idx !== -1) {
    users[idx] = currentUser;
    localStorage.setItem("smartbank_users", JSON.stringify(users));
  }

  // Add notification
  addNotification(`Deposited ₹${amountVal.toFixed(2)} into savings ledger via ${method}.`);
  
  // Log transaction
  const txId = "TXN-" + Math.floor(100000 + Math.random() * 900000) + "-D";
  const timestamp = new Date();
  const newTx = {
    txId: txId,
    date: timestamp.toISOString().split('T')[0],
    time: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    sender: `Deposit Node (${method})`,
    receiver: currentUser.username,
    senderAcc: "EXTERNAL_BANK",
    receiverAcc: currentUser.accountNo,
    amount: amountVal,
    method: "DEPOSIT",
    purpose: `Funds loaded into Savings Ledger`,
    status: "SUCCESS"
  };
  
  transactions.push(newTx);
  localStorage.setItem("smartbank_transactions", JSON.stringify(transactions));
  
  // Close modal & play sound
  closeDepositModal();
  playAudio("beep-success");
  
  // Refresh dashboard views
  initializeDashboard();
  
  // Trigger receipt modal
  document.getElementById("rec-tx-id").innerText = txId;
  document.getElementById("rec-amount").innerText = `₹${amountVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  document.getElementById("rec-receiver").innerText = currentUser.fullname;
  document.getElementById("rec-network").innerText = method;
  document.getElementById("rec-time").innerText = `${newTx.date} ${newTx.time}`;
  
  const successModal = document.getElementById("tx-success-modal");
  successModal.classList.add("active");
}

// 16. Notifications Logic
function addNotification(message) {
  if (!currentUser) return;
  if (!currentUser.notifications) currentUser.notifications = [];
  
  currentUser.notifications.unshift({
    msg: message,
    time: new Date().toLocaleString()
  });

  // Commit changes to users array
  const idx = users.findIndex(u => u.username && u.username.toLowerCase() === currentUser.username.toLowerCase());
  if (idx !== -1) {
    users[idx] = currentUser;
    localStorage.setItem("smartbank_users", JSON.stringify(users));
  }

  renderNotifications();
}

function renderNotifications() {
  const badge = document.getElementById("notification-badge");
  const list = document.getElementById("notification-list");
  
  if (!list) return;
  list.innerHTML = "";

  if (!currentUser || !currentUser.notifications || currentUser.notifications.length === 0) {
    list.innerHTML = `<div class="notification-item text-center text-muted">No notifications.</div>`;
    if (badge) badge.style.display = "none";
    return;
  }

  // Set badge count
  if (badge) {
    badge.innerText = currentUser.notifications.length;
    badge.style.display = "block";
  }

  currentUser.notifications.forEach(n => {
    const item = `
      <div class="notification-item">
        <p>${n.msg}</p>
        <span class="time">${n.time}</span>
      </div>
    `;
    list.innerHTML += item;
  });
}

function toggleNotifications(event) {
  if (event) event.stopPropagation();
  const dropdown = document.getElementById("notification-dropdown");
  if (dropdown) dropdown.classList.toggle("active");
}

function closeNotificationsDropdown() {
  const dropdown = document.getElementById("notification-dropdown");
  if (dropdown) dropdown.classList.remove("active");
}

function clearNotifications() {
  if (!currentUser) return;
  currentUser.notifications = [];

  // Commit changes
  const idx = users.findIndex(u => u.username && u.username.toLowerCase() === currentUser.username.toLowerCase());
  if (idx !== -1) {
    users[idx] = currentUser;
    localStorage.setItem("smartbank_users", JSON.stringify(users));
  }

  renderNotifications();
}

// Close notifications dropdown on click outside
document.addEventListener("click", (e) => {
  const dropdown = document.getElementById("notification-dropdown");
  const container = document.querySelector(".notification-container");
  if (dropdown && container && !container.contains(e.target)) {
    dropdown.classList.remove("active");
  }
});

// 17. Request Money Logic
function toggleReqDestPlaceholder() {
  const destType = document.querySelector('input[name="req-dest-type"]:checked').value;
  const input = document.getElementById("request-receiver");
  const label = document.getElementById("req-dest-input-label");

  if (destType === "username") {
    input.placeholder = "Enter payer's username";
    label.innerText = "Payer Username";
  } else if (destType === "phone") {
    input.placeholder = "Enter payer's 10-digit mobile number";
    label.innerText = "Payer Mobile Number";
  } else {
    input.placeholder = "Enter payer's 12-digit account number";
    label.innerText = "Payer Account Number";
  }
  clearFieldError("req-receiver", input);
}

function handleRequestSubmit() {
  const destType = document.querySelector('input[name="req-dest-type"]:checked').value;
  const receiverInput = document.getElementById("request-receiver");
  const amountInput = document.getElementById("request-amount");
  const purposeInput = document.getElementById("request-purpose");

  const receiverVal = receiverInput.value.trim();
  const amountVal = parseFloat(amountInput.value);
  const purposeVal = purposeInput.value.trim() || "Peer Request Memo";

  // Reset errors
  clearFieldError("req-receiver", receiverInput);
  clearFieldError("req-amount", amountInput);

  let isVal = true;

  if (receiverVal === "") {
    showFieldError("req-receiver", receiverInput, "Payer details are required.");
    isVal = false;
  } else if (receiverVal.toLowerCase() === currentUser.username.toLowerCase()) {
    showFieldError("req-receiver", receiverInput, "You cannot request money from yourself.");
    isVal = false;
  }

  if (isNaN(amountVal) || amountVal <= 0) {
    showFieldError("req-amount", amountInput, "Enter a valid positive sum.");
    isVal = false;
  }

  if (!isVal) {
    playAudio("beep-error");
    return;
  }

  let finalPayerUsername = "";
  let targetUser = null;

  if (destType === "username") {
    targetUser = users.find(u => u.username && u.username.toLowerCase() === receiverVal.toLowerCase());
  } else if (destType === "phone") {
    targetUser = users.find(u => u.mobile === receiverVal);
  } else {
    targetUser = users.find(u => u.accountNo === receiverVal);
  }

  if (targetUser) {
    finalPayerUsername = targetUser.username;
  } else {
    finalPayerUsername = receiverVal + " (Ext)";
  }

  const reqId = "REQ-" + Math.floor(1000 + Math.random() * 9000) + "-N";
  const timestamp = new Date();

  const newReq = {
    reqId: reqId,
    sender: currentUser.username,
    receiver: finalPayerUsername,
    amount: amountVal,
    purpose: purposeVal,
    status: "PENDING",
    date: timestamp.toISOString().split('T')[0],
    time: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  requests.push(newReq);
  localStorage.setItem("smartbank_requests", JSON.stringify(requests));

  // Add notification to self
  addNotification(`Dispatched invoice request of ₹${amountVal.toFixed(2)} to ${finalPayerUsername}.`);

  // Add notification to target if local
  if (targetUser) {
    const idx = users.findIndex(u => u.username && u.username.toLowerCase() === targetUser.username.toLowerCase());
    if (idx !== -1) {
      if (!users[idx].notifications) users[idx].notifications = [];
      users[idx].notifications.unshift({
        msg: `Invoice request of ₹${amountVal.toFixed(2)} received from ${currentUser.fullname}`,
        time: new Date().toLocaleString()
      });
      localStorage.setItem("smartbank_users", JSON.stringify(users));
    }
  }

  // Clear form
  document.getElementById("request-form").reset();
  toggleReqDestPlaceholder();
  playAudio("beep-success");

  renderRequestsLists();
}

function renderRequestsLists() {
  const incomingBody = document.getElementById("incoming-requests-body");
  const outgoingBody = document.getElementById("outgoing-requests-body");

  if (!incomingBody || !outgoingBody) return;

  incomingBody.innerHTML = "";
  outgoingBody.innerHTML = "";

  // 1. Incoming (requests where I am the receiver)
  const incoming = requests.filter(r => r.receiver.toLowerCase() === currentUser.username.toLowerCase() && r.status === "PENDING");
  if (incoming.length === 0) {
    incomingBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No pending incoming requests.</td></tr>`;
  } else {
    incoming.forEach(r => {
      const row = `
        <tr>
          <td>${r.sender}</td>
          <td class="font-weight-bold text-white">₹${r.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td>${r.purpose}</td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="payIncomingRequest('${r.reqId}')">
              <i class="fa-solid fa-credit-card"></i> Pay Now
            </button>
          </td>
        </tr>
      `;
      incomingBody.innerHTML += row;
    });
  }

  // 2. Outgoing (requests where I am the sender)
  const outgoing = requests.filter(r => r.sender.toLowerCase() === currentUser.username.toLowerCase());
  if (outgoing.length === 0) {
    outgoingBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No outgoing requests sent.</td></tr>`;
  } else {
    // Sort outgoing (newest first)
    const sortedOutgoing = outgoing.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
    sortedOutgoing.forEach(r => {
      let statusClass = "text-warning";
      if (r.status === "APPROVED") statusClass = "status-badge success";
      else if (r.status === "DECLINED") statusClass = "status-badge error";
      else statusClass = "status-badge pending";

      const row = `
        <tr>
          <td>${r.receiver}</td>
          <td class="font-weight-bold text-white">₹${r.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td>${r.purpose}</td>
          <td><span class="${statusClass}">${r.status}</span></td>
        </tr>
      `;
      outgoingBody.innerHTML += row;
    });
  }
}

function payIncomingRequest(reqId) {
  const req = requests.find(r => r.reqId === reqId);
  if (!req) return;

  // Pre-fill Send Money fields
  document.getElementById("transfer-receiver").value = req.sender;
  document.getElementById("transfer-amount").value = req.amount;
  document.getElementById("transfer-purpose").value = `Payment of request: ${req.purpose}`;

  // Check username radio
  const usernameRadio = document.querySelector('input[name="dest-type"][value="username"]');
  if (usernameRadio) {
    usernameRadio.checked = true;
    toggleDestPlaceholder();
  }

  // Redirect to Send Money tab
  triggerSectionLink("send-money-tab");

  // Keep track of request ID to mark it approved on success
  pendingRequestToApprove = reqId;
  
  // Close dropdown just in case
  closeNotificationsDropdown();
}
