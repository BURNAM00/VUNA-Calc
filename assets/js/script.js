var left = "";
var operator = "";
var right = "";

function appendToResult(value) {
  if (operator.length == 0) {
    left += value;
  } else {
    right += value;
  }
  updateResult();
}

function bracketToResult(value) {
  // For now, just append to the display - brackets would need more complex parsing
  document.getElementById("result").value += value;
}

function operatorToResult(value) {
  if (right.length) {
    calculateResult();
  }
  operator = value;
  updateResult();
}

function clearResult() {
  left = "";
  right = "";
  operator = "";
  document.getElementById("result").value = "";
  document.getElementById("word-result").innerHTML = "";
  updateResult();
}

function backspace() {
  let currentValue = document.getElementById("result").value;
  if (currentValue.length > 0) {
    document.getElementById("result").value = currentValue.slice(0, -1);

    // Update internal variables based on current state
    if (right.length > 0) {
      right = right.slice(0, -1);
    } else if (operator.length > 0) {
      operator = "";
    } else if (left.length > 0) {
      left = left.slice(0, -1);
    }
    updateResult();
  }
}

function calculateResult() {
  if (left && operator && right) {
    let leftNum = parseFloat(left);
    let rightNum = parseFloat(right);
    let result;

    switch (operator) {
      case "+":
        result = leftNum + rightNum;
        break;
      case "-":
        result = leftNum - rightNum;
        break;
      case "*":
        result = leftNum * rightNum;
        break;
      case "/":
        if (rightNum === 0) {
          alert("Cannot divide by zero!");
          return;
        }
        result = leftNum / rightNum;
        break;
      default:
        return;
    }

    // Update display and reset for next calculation
    left = result.toString();
    operator = "";
    right = "";
    updateResult();
  }
}

function updateResult() {
  let displayValue = left + operator + right;
  document.getElementById("result").value = displayValue;

  // Convert result to words if we have a complete number
  if (left && !operator && !right) {
    let numValue = parseFloat(left);
    if (!isNaN(numValue)) {
      let wordsResult = numberToWords(numValue);
      document.getElementById("word-result").innerHTML = wordsResult;
    }
  } else {
    document.getElementById("word-result").innerHTML = "";
  }
}

function numberToWords(num) {
  if (num === 0) return "zero";

  const ones = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  const teens = [
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  const thousands = ["", "thousand", "million", "billion"];

  function convertHundreds(n) {
    let result = "";

    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + " hundred";
      n %= 100;
      if (n > 0) result += " ";
    }

    if (n >= 20) {
      result += tens[Math.floor(n / 10)];
      n %= 10;
      if (n > 0) result += "-" + ones[n];
    } else if (n >= 10) {
      result += teens[n - 10];
    } else if (n > 0) {
      result += ones[n];
    }

    return result;
  }

  // Handle negative numbers
  if (num < 0) {
    return "negative " + numberToWords(-num);
  }

  // Handle decimal numbers
  if (num % 1 !== 0) {
    let parts = num.toString().split(".");
    let wholePart = parseInt(parts[0]);
    let decimalPart = parts[1];

    let result = numberToWords(wholePart) + " point";
    for (let digit of decimalPart) {
      result += " " + ones[parseInt(digit)];
    }
    return result;
  }

  // Handle whole numbers
  if (num < 1000) {
    return convertHundreds(num);
  }

  let result = "";
  let thousandIndex = 0;

  while (num > 0) {
    let chunk = num % 1000;
    if (chunk !== 0) {
      let chunkWords = convertHundreds(chunk);
      if (thousandIndex > 0) {
        chunkWords += " " + thousands[thousandIndex];
      }
      result = chunkWords + (result ? " " + result : "");
    }
    num = Math.floor(num / 1000);
    thousandIndex++;
  }

  return result;
}
