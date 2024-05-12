// Define variables to access DOM elements
const CryptoOne = document.getElementById("Crypto-one");
const CryptoTwo = document.getElementById("Crypto-two");
const amountInputOne = document.getElementById("amountInput-one");
const amountInputTwo = document.getElementById("amountInput-two");
const rate = document.getElementById("rate");
const swapButton = document.getElementById("swap");
const outputOne = document.getElementById("outputOne");
const outputTwo = document.getElementById("outputTwo");
const executeTran = document.getElementById("execute"); // Corrected variable name
const transactionHistory = JSON.parse(localStorage.getItem("transactionHistory")) || []; // Retrieve transaction history from local storage

let firstCurrCurrentPrice; // Store current price of the first cryptocurrency
let secondCurrCurrentPrice; // Store current price of the second cryptocurrency
let currOne;
let currTwo;

// Function to show loading spinner
function showLoading() {
  const overlay = document.getElementById("overlay");
  overlay.style.display = "block";
}

// Function to hide loading spinner
function hideLoading() {
  const overlay = document.getElementById("overlay");
  overlay.style.display = "none";
}

// Define a cache object to store fetched data
const cache = {};

async function fetchData(curr) {
  if (cache[curr]) {
    // If data is already cached, return it
    return cache[curr];
  } else {
    // If data is not cached, fetch it from the API
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${curr}`
    );
    const data = await response.json();
    const cryptoTokenName = data[0];
    const currentPrice = cryptoTokenName.current_price;

    // Store fetched data in the cache
    cache[curr] = currentPrice;

    return currentPrice;
  }
}

// Function to calculate conversion between cryptocurrencies
async function calculate() {
  currOne = CryptoOne.value; // Get first cryptocurrency

  try {
    // Fetch data for the first cryptocurrency
    firstCurrCurrentPrice = await fetchData(currOne);
    if (firstCurrCurrentPrice) {
      showMessage("Transaction Started!", "success"); // Show success message
    }

    outputOne.style.visibility = "visible";
    outputOne.innerText =
      "$" + (firstCurrCurrentPrice * amountInputOne.value).toFixed(2); // Update output

    // Add transaction to transaction history
    const transaction = {
      CryptoOne: currOne,
      amountOne: amountInputOne.value,
      CryptoTwo: currTwo,
      amountTwo: amountInputTwo.value,
    };
    transactionHistory.push(transaction); // Store transaction
    executeTransaction();

    // Rest of the calculation logic...
  } catch (error) {
    // Error handling...
    if (!outputOne.innerText) {
      showLoading(); // Show loading spinner
      showMessage("Please wait for a minute...", "error");
    } // Show error message
  } finally {
    hideLoading(); // Hide loading spinner
  }
}

async function executeTransaction() {
  try {
    // Fetch data for the second cryptocurrency
    currTwo = CryptoTwo.value; // Get second cryptocurrency
    secondCurrCurrentPrice = await fetchData(currTwo);
    outputTwo.style.visibility = "visible";
    outputTwo.innerText =
      "$" + (secondCurrCurrentPrice * amountInputOne.value).toFixed(2); // Update output

    // Calculate conversion rate and update input
    amountInputTwo.value =
      (firstCurrCurrentPrice / secondCurrCurrentPrice) * amountInputOne.value;
    rate.innerText = `1 ${currOne} = ${
      firstCurrCurrentPrice / secondCurrCurrentPrice
    } ${currTwo}`;
    rate.toFixed(2);

    // Update transaction history modal
    populateTransactionHistoryModal();
  } catch (error) {
    // Error handling...
    if (!outputOne.innerText) {
      showMessage("Please wait for a minute...", "error");
    }
  }
}

// Function to swap currencies
function swapCurrencies() {
  // Check if amounts are valid
  if (!amountInputOne.value || !amountInputTwo.value) {
    showMessage("Please enter valid amounts."); // Show error message
    return;
  }
  // Swap cryptocurrencies
  const temp = CryptoOne.value;
  CryptoOne.value = CryptoTwo.value;
  CryptoTwo.value = temp;
  // Swap amounts
  const tempo = amountInputOne.value;
  amountInputOne.value = amountInputTwo.value;
  amountInputTwo.value = tempo;
  // Swap outputs
  const temporary = outputOne.innerText;
  outputOne.innerText = outputTwo.innerText;
  outputTwo.innerText = temporary;
  // Update conversion rate
  rate.innerText = `1 ${CryptoOne.value} = ${
    secondCurrCurrentPrice / firstCurrCurrentPrice
  } ${CryptoTwo.value}`;
  calculate();
  executeTransaction();
}

// Function to show message
function showMessage(message, type = "error") {
  const messageElement = document.getElementById("message");
  messageElement.textContent = message;
  messageElement.className =
    type === "error" ? "text-danger text-center" : "text-success text-center";
}

// Event listeners for input changes and button clicks
CryptoOne.addEventListener("change", calculate);
amountInputOne.addEventListener("input", calculate);
swapButton.addEventListener("click", swapCurrencies);
executeTran.addEventListener("click", executeTransaction);

calculate(); // Initial calculation

// Function to populate transaction history modal
function populateTransactionHistoryModal() {
  const modalBody = document.getElementById("transactionHistoryTableBody");
  modalBody.innerHTML = ""; // Clear previous content
  if (transactionHistory.length === 0) {
    modalBody.innerHTML = `<tr><td colspan="5" class="text-center">No data found</td></tr>`;
  } else {
    // Iterate through transaction history and populate modal
    transactionHistory.forEach((transaction, index) => {
      const row = `
          <tr>
              <th scope="row">${index + 1}</th>
              <td>${transaction.CryptoOne}</td>
              <td>${transaction.amountOne}</td>
              <td>${transaction.CryptoTwo}</td>
              <td>${transaction.amountTwo}</td>
          </tr>
      `;
      modalBody.insertAdjacentHTML("beforeend", row);
    });
    // Store transaction history data in local storage
    localStorage.setItem("transactionHistory", JSON.stringify(transactionHistory));
  }
}

// Show transaction history modal
document.getElementById("showTransactionHistoryButton").addEventListener("click", function () {
  populateTransactionHistoryModal();
  const transactionHistoryModal = new bootstrap.Modal(document.getElementById("transactionHistoryModal"));
  transactionHistoryModal.show();
});
