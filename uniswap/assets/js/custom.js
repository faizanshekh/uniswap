// Define variables to access DOM elements
const CryptoOne = document.getElementById('Crypto-one');
const CryptoTwo = document.getElementById('Crypto-two');
const amountInputOne = document.getElementById('amountInput-one');
const amountInputTwo = document.getElementById('amountInput-two');
const rate = document.getElementById('rate');
const swapButton = document.getElementById('swap');
const outputOne = document.getElementById('outputOne');
const outputTwo = document.getElementById('outputTwo');
const transactionHistory = []; // Store transaction history
let firstCurrCurrentPrice; // Store current price of the first cryptocurrency
let secondCurrCurrentPrice; // Store current price of the second cryptocurrency

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

// Function to calculate conversion between cryptocurrencies
async function calculate() {
    const currOne = CryptoOne.value; // Get first cryptocurrency
    const currTwo = CryptoTwo.value; // Get second cryptocurrency
    showMessage("App Successfully work", "success"); // Show success message
    try {
        // Fetch data for the first cryptocurrency
        const response1 = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${currOne}`);
        const data1 = await response1.json();
        const cryptoTokenName01 = data1[0];
        firstCurrCurrentPrice = cryptoTokenName01.current_price; // Store current price
        outputOne.style.visibility = "visible";
        outputOne.innerText = "$" + (firstCurrCurrentPrice * amountInputOne.value).toFixed(2); // Update output
        // Fetch data for the second cryptocurrency
        const response2 = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${currTwo}`);
        const data2 = await response2.json();
        const cryptoTokenName02 = data2[0];
        secondCurrCurrentPrice = cryptoTokenName02.current_price; // Store current price
        outputTwo.style.visibility = "visible";
        outputTwo.innerText = "$" + secondCurrCurrentPrice.toFixed(2); // Update output
        // Calculate conversion rate and update input
        amountInputTwo.value = (firstCurrCurrentPrice / secondCurrCurrentPrice) * amountInputOne.value;
        rate.innerText = `1 ${currOne} = ${firstCurrCurrentPrice / secondCurrCurrentPrice} ${currTwo}`;
        // Add transaction to transaction history
        const transaction = {
            CryptoOne: currOne,
            amountOne: amountInputOne.value,
            CryptoTwo: currTwo,
            amountTwo: amountInputTwo.value
        };
        transactionHistory.push(transaction); // Store transaction
        // Update transaction history modal
        populateTransactionHistoryModal();
    } catch (error) {
        // Handle error
        if (!amountInputTwo.value) {
            console.error("Error fetching data:", error);
            showLoading(); // Show loading spinner
            showMessage("Failed to fetch data. Please wait.", "error"); // Show error message
        }
    } finally {
        hideLoading(); // Hide loading spinner
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
    rate.innerText = `1 ${CryptoOne.value} = ${secondCurrCurrentPrice / firstCurrCurrentPrice} ${CryptoTwo.value}`;
    // Check if swapping is successful
    if (amountInputTwo.value > 0) {
        showMessage("Swap successful.", "success"); // Show success message
    } else {
        showMessage("Swap failed. Please try again.", "error"); // Show error message
    }
    calculate(); // Recalculate conversion
}

// Function to show message
function showMessage(message, type = "error") {
    const messageElement = document.getElementById("message");
    messageElement.textContent = message;
    messageElement.className = type === "error" ? "text-danger text-center" : "text-success text-center";
}

// Event listeners for input changes and button clicks
CryptoOne.addEventListener('change', calculate);
CryptoTwo.addEventListener('change', calculate);
amountInputOne.addEventListener('input', calculate);
amountInputTwo.addEventListener('input', calculate);
swapButton.addEventListener('click', swapCurrencies);

calculate(); // Initial calculation

// Function to populate transaction history modal
document.addEventListener('DOMContentLoaded', function () {
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
                // Store transaction history data in local storage
                localStorage.setItem("transactionHistory", JSON.stringify(transactionHistory));
            });
        }
    }

    // Show transaction history modal
    document.getElementById("showTransactionHistoryButton").addEventListener("click", function () {
        populateTransactionHistoryModal();
        const transactionHistoryModal = new bootstrap.Modal(document.getElementById("transactionHistoryModal"));
        transactionHistoryModal.show();
    });
});
