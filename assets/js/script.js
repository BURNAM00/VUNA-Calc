var left = "";
var operator = "";
var right = "";

// Calculator Functionality
function appendToResult(value) {
  if (operator.length === 0) {
    left += value.toString();
  } else {
    right += value.toString();
  }
  updateResult();
}

function bracketToResult(value) {
  if (operator.length === 0) {
    left += value;
  } else {
    right += value;
  }
  updateResult();
}

function backspace() {
  if (right.length > 0) {
    right = right.slice(0, -1);
  } else if (operator.length > 0) {
    operator = "";
  } else if (left.length > 0) {
    left = left.slice(0, -1);
  }
  updateResult();
}

function operatorToResult(value) {
  if (left.length === 0) return;
  if (right.length > 0) {
    calculateResult();
  }
  operator = value;
  updateResult();
}

function clearResult() {
  left = "";
  right = "";
  operator = "";
  document.getElementById("word-result").innerHTML = "";
  document.getElementById("word-area").style.display = "none";
  updateResult();
}

function calculateResult() {
  if (left.length === 0 || operator.length === 0 || right.length === 0) return;

  let result;
  const l = parseFloat(left);
  const r = parseFloat(right);

  switch (operator) {
    case "+":
      result = l + r;
      break;
    case "-":
      result = l - r;
      break;
    case "*":
      result = l * r;
      break;
    case "/":
      result = r !== 0 ? l / r : "Error";
      break;
    default:
      return;
  }

  left = result.toString();
  operator = "";
  right = "";
  updateResult();
}

function numberToWords(num) {
  if (num === "Error") return "Error";
  if (num === "") return "";

  const n = parseFloat(num);
  if (isNaN(n)) return "";
  if (n === 0) return "Zero";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const scales = ["", "Thousand", "Million", "Billion", "Trillion"];

  function convertGroup(val) {
    let res = "";
    if (val >= 100) {
      res += ones[Math.floor(val / 100)] + " Hundred ";
      val %= 100;
    }
    if (val >= 10 && val <= 19) {
      res += teens[val - 10] + " ";
    } else if (val >= 20) {
      res +=
        tens[Math.floor(val / 10)] +
        (val % 10 !== 0 ? "-" + ones[val % 10] : "") +
        " ";
    } else if (val > 0) {
      res += ones[val] + " ";
    }
    return res.trim();
  }

  let sign = n < 0 ? "Negative " : "";
  let absN = Math.abs(n);
  let parts = absN.toString().split(".");
  let integerPart = parseInt(parts[0]);
  let decimalPart = parts[1];

  let wordArr = [];
  if (integerPart === 0) {
    wordArr.push("Zero");
  } else {
    let scaleIdx = 0;
    while (integerPart > 0) {
      let chunk = integerPart % 1000;
      if (chunk > 0) {
        let chunkWords = convertGroup(chunk);
        wordArr.unshift(
          chunkWords + (scales[scaleIdx] ? " " + scales[scaleIdx] : ""),
        );
      }
      integerPart = Math.floor(integerPart / 1000);
      scaleIdx++;
    }
  }

  let result = sign + wordArr.join(", ").trim();

  if (decimalPart) {
    result += " Point";
    for (let digit of decimalPart) {
      result += " " + (digit === "0" ? "Zero" : ones[parseInt(digit)]);
    }
  }

  return result.trim();
}

function updateResult() {
  const display = left + (operator ? " " + operator + " " : "") + right;
  document.getElementById("result").value = display || "0";

  const wordResult = document.getElementById("word-result");
  const wordArea = document.getElementById("word-area");

  if (left && !operator && !right) {
    wordResult.innerHTML =
      '<span class="small-label">Result in words</span><strong>' +
      numberToWords(left) +
      "</strong>";
    wordArea.style.display = "flex";
  } else {
    wordResult.innerHTML = "";
    wordArea.style.display = "none";
  }
  enableSpeakButton();
}

function speakResult() {
  const speakBtn = document.getElementById("speak-btn");
  const wordResultEl = document.getElementById("word-result");

  const words = wordResultEl.querySelector("strong")?.innerText || "";

  if (!words) return;

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    speakBtn.classList.remove("speaking");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(words);
  utterance.rate = 0.9;
  utterance.onstart = () => speakBtn.classList.add("speaking");
  utterance.onend = () => speakBtn.classList.remove("speaking");
  window.speechSynthesis.speak(utterance);
}

function enableSpeakButton() {
  const speakBtn = document.getElementById("speak-btn");
  if (!speakBtn) return;
  const hasContent =
    document.getElementById("word-result").innerHTML.trim().length > 0;
  speakBtn.disabled = !hasContent;
}

// Currency Converter Functionality
let exchangeRates = {};
let currentMode = 'calculator';
let isLoadingRates = false;

// Switch between calculator and currency converter modes
function switchMode(mode) {
    const calcMode = document.getElementById('calculator-mode');
    const currencyMode = document.getElementById('currency-mode');
    const calcBtn = document.getElementById('calc-mode-btn');
    const currencyBtn = document.getElementById('currency-mode-btn');
    
    if (mode === 'calculator') {
        calcMode.style.display = 'block';
        currencyMode.style.display = 'none';
        calcBtn.classList.add('active');
        currencyBtn.classList.remove('active');
        currentMode = 'calculator';
    } else {
        calcMode.style.display = 'block'; // Make sure parent is visible if needed, but they are siblings now
        currencyMode.style.display = 'block';
        calcMode.style.display = 'none'; // Hide calculator
        calcBtn.classList.remove('active');
        currencyBtn.classList.add('active');
        currentMode = 'currency';
        
        // Load exchange rates when switching to currency mode
        if (Object.keys(exchangeRates).length === 0 && !isLoadingRates) {
            loadExchangeRates();
        }
    }
}

// Load exchange rates from API
async function loadExchangeRates() {
    if (isLoadingRates) return;
    isLoadingRates = true;
    
    try {
        // Using exchangerate-api.com (free tier)
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        if (!data || !data.rates) throw new Error('Invalid data format received');
        
        exchangeRates = data.rates;
        exchangeRates.USD = 1; // Add USD as base
        
        // Show success indicator
        showCurrencyStatus('Exchange rates loaded successfully', 'success');
        
        // If there's already an amount, convert it
        const amount = document.getElementById('currency-amount').value;
        if (amount) {
            convertCurrency();
        }
    } catch (error) {
        console.error('Error loading exchange rates:', error);
        showCurrencyStatus('Failed to load exchange rates. Using offline rates.', 'error');
        
        // Fallback rates (updated with current rates)
        exchangeRates = {
            USD: 1,
            EUR: 0.853,
            GBP: 0.744,
            JPY: 158.01,
            NGN: 1418.92,
            CAD: 1.38,
            AUD: 1.49,
            CHF: 0.79,
            CNY: 6.97,
            INR: 91.1
        };

        // If there's already an amount, convert it (even with offline rates)
        const amount = document.getElementById('currency-amount').value;
        if (amount) {
            convertCurrency();
        }
    } finally {
        isLoadingRates = false;
    }
}

// Update Flags based on selection
function updateFlags() {
    const fromCurrency = document.getElementById('from-currency').value;
    const toCurrency = document.getElementById('to-currency').value;
    
    const countryMap = {
        USD: 'US', EUR: 'EU', GBP: 'GB', JPY: 'JP', NGN: 'NG',
        CAD: 'CA', AUD: 'AU', CHF: 'CH', CNY: 'CN', INR: 'IN'
    };

    const fromFlag = document.getElementById('from-flag-img');
    const toFlag = document.getElementById('to-flag-img');

    if(fromFlag) fromFlag.src = `https://flagsapi.com/${countryMap[fromCurrency]}/flat/64.png`;
    if(toFlag) toFlag.src = `https://flagsapi.com/${countryMap[toCurrency]}/flat/64.png`;
}

// Convert currency
function convertCurrency() {
    updateFlags(); // Ensure flags are updated

    const amount = parseFloat(document.getElementById('currency-amount').value);
    const fromCurrency = document.getElementById('from-currency').value;
    const toCurrency = document.getElementById('to-currency').value;
    const resultArea = document.getElementById('currency-result-area');
    const resultDiv = document.getElementById('currency-result');
    
    if (!amount || amount <= 0) {
        resultArea.style.display = 'none';
        return;
    }
    
    if (Object.keys(exchangeRates).length === 0) {
        if (!isLoadingRates) {
            showCurrencyStatus('Loading exchange rates...', 'info');
            loadExchangeRates();
        }
        return;
    }
    
    // Convert to USD first, then to target currency
    const usdAmount = amount / exchangeRates[fromCurrency];
    const convertedAmount = usdAmount * exchangeRates[toCurrency];
    
    // Format the result
    const formattedAmount = convertedAmount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    // Get currency symbols
    const fromSymbol = getCurrencySymbol(fromCurrency);
    const toSymbol = getCurrencySymbol(toCurrency);
    
    resultDiv.innerHTML = `
        <span class="small-label">Conversion Result</span>
        <strong>${fromSymbol}${amount.toLocaleString()} ${fromCurrency} = ${toSymbol}${formattedAmount} ${toCurrency}</strong>
    `;
    
    resultArea.style.display = 'flex';
    enableCurrencySpeakButton();
}

// Get currency symbol
function getCurrencySymbol(currency) {
    const symbols = {
        USD: '$',
        EUR: '€',
        GBP: '£',
        JPY: '¥',
        NGN: '₦',
        CAD: 'C$',
        AUD: 'A$',
        CHF: 'CHF ',
        CNY: '¥',
        INR: '₹'
    };
    return symbols[currency] || '';
}

// Set quick amount
function setAmount(amount) {
    document.getElementById('currency-amount').value = amount;
    convertCurrency();
}

// Swap currencies
function swapCurrencies() {
    const fromSelect = document.getElementById('from-currency');
    const toSelect = document.getElementById('to-currency');
    
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    
    convertCurrency();
}

// Clear currency converter
function clearCurrency() {
    document.getElementById('currency-amount').value = '';
    document.getElementById('currency-result-area').style.display = 'none';
    document.getElementById('currency-result').innerHTML = '';
}

// Show currency status message
function showCurrencyStatus(message, type) {
    const resultDiv = document.getElementById('currency-result');
    const resultArea = document.getElementById('currency-result-area');
    
    const colors = {
        success: '#2ecc71',
        error: '#e74c3c',
        info: '#3498db'
    };
    
    resultDiv.innerHTML = `<span style="color: ${colors[type]};">${message}</span>`;
    resultArea.style.display = 'flex';
    
    if (type !== 'error') {
        setTimeout(() => {
            if (resultDiv.innerHTML === `<span style="color: ${colors[type]};">${message}</span>`) {
                resultArea.style.display = 'none'; // Only hide if message hasn't changed
            }
        }, 3000);
    }
}

// Enable currency speak button
function enableCurrencySpeakButton() {
    const speakBtn = document.getElementById('currency-speak-btn');
    if (!speakBtn) return;
    const hasContent = document.getElementById('currency-result').innerHTML.trim().length > 0;
    speakBtn.disabled = !hasContent;
}

// Speak currency result
function speakCurrencyResult() {
    const speakBtn = document.getElementById('currency-speak-btn');
    const resultEl = document.getElementById('currency-result');
    
    // Get text content only
    const text = resultEl.querySelector('strong')?.innerText || '';
    
    if (!text) return;
    
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        speakBtn.classList.remove('speaking');
        return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onstart = () => speakBtn.classList.add('speaking');
    utterance.onend = () => speakBtn.classList.remove('speaking');
    window.speechSynthesis.speak(utterance);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Set default mode to calculator
    switchMode('calculator');
    
    // Initialize flags
    updateFlags();

    // Add keyboard support for calculator
    document.addEventListener('keydown', function(event) {
        if (currentMode !== 'calculator') return;
        
        const key = event.key;
        
        if (key >= '0' && key <= '9') {
            appendToResult(key);
        } else if (key === '.') {
            appendToResult('.');
        } else if (key === '+') {
            operatorToResult('+');
        } else if (key === '-') {
            operatorToResult('-');
        } else if (key === '*' || key.toLowerCase() === 'x') {
            operatorToResult('*');
        } else if (key === '/') {
            event.preventDefault();
            operatorToResult('/');
        } else if (key === 'Enter' || key === '=') {
            calculateResult();
        } else if (key === 'Backspace') {
            backspace();
        } else if (key === 'Escape') {
            clearResult();
        }
    });
});