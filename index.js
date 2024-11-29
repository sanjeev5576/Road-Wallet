// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getDatabase, ref, set, push, onValue, remove } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChBJskPokDf3HDEgZ2Nv2IuqI-4KV6QOA",
  authDomain: "road-wallet-app-9251d.firebaseapp.com",
  databaseURL: "https://road-wallet-app-9251d-default-rtdb.firebaseio.com",
  projectId: "road-wallet-app-9251d",
  storageBucket: "road-wallet-app-9251d.firebasestorage.app",
  messagingSenderId: "833971521374",
  appId: "1:833971521374:web:1bbf1ae8bb752951c8f1cf",
  measurementId: "G-D7D66DD6Y2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app); // Get a reference to the Firebase Realtime Database

// State variables
let travelers = [];
let expenses = [];
let totalExpenses = 0;

// DOM elements
const totalExpensesElem = document.getElementById('total-expenses');
const expenseListElem = document.getElementById('expense-list');
const travelerListElem = document.getElementById('traveler-list');
const modal = document.getElementById('traveler-modal');

// Update Firebase: Add a new expense
function addExpenseToFirebase(expense) {
  const expenseRef = ref(db, 'expenses');
  push(expenseRef, expense); // Push the expense object to the database
}

// Add Expense
document.getElementById('add-expense').addEventListener('click', () => {
  const name = document.getElementById('expense-name').value.trim();
  const amount = parseFloat(document.getElementById('expense-amount').value.trim());
  const category = document.getElementById('expense-category').value;

  if (!name || isNaN(amount)) {
    alert('Please enter valid expense details');
    return;
  }

  const expense = { name, amount, category };
  addExpenseToFirebase(expense); // Add expense to Firebase
});

// Listen for real-time expense updates
onValue(ref(db, 'expenses'), (snapshot) => {
  expenses = [];
  totalExpenses = 0;

  snapshot.forEach((childSnapshot) => {
    const expense = childSnapshot.val();
    expense.key = childSnapshot.key; // Store the key for deletion
    expenses.push(expense);
    totalExpenses += expense.amount;
  });

  updateUI(); // Update the UI when data changes
});

// Remove Expense
// Remove Expense from Firebase
function removeExpenseFromFirebase(key) {
  const expenseRef = ref(db, `expenses/${key}`);
  remove(expenseRef); // Remove the specific expense from Firebase
}

// Attach the remove function to the global scope (window object)
window.removeExpenseFromFirebase = removeExpenseFromFirebase;


// Update UI function to display expenses in descending order
function updateUI() {
  // Update total expenses
  totalExpensesElem.textContent = totalExpenses.toFixed(2); // Ensure 2 decimal places

  // Sort expenses in descending order by amount
  expenses.sort((a, b) => b.amount - a.amount); // Sort by amount, descending

  // Render expense list
  expenseListElem.innerHTML = expenses.map((expense, index) => `
    <li>
      ${expense.name} - ${expense.category}: Rs ${expense.amount.toFixed(2)}
      <button class="remove-btn" onclick="removeExpense(${index})">Remove</button>
    </li>
  `).join('');

  // Render traveler cost shares
  if (travelers.length > 0) {
    travelerListElem.innerHTML = travelers.map(traveler => `
      <li><strong>${traveler.name}</strong>: Rs ${(totalExpenses / travelers.length).toFixed(2)}</li>
    `).join('');
  } else {
    travelerListElem.innerHTML = `<p>No travelers added yet.</p>`;
  }
}


// Update Firebase: Add a new traveler
function addTravelerToFirebase(traveler) {
  const travelerRef = ref(db, 'travelers');
  push(travelerRef, traveler); // Push the traveler object to the database
}

// Add Traveler
document.getElementById('add-traveler').addEventListener('click', () => {
  const name = document.getElementById('new-traveler-name').value.trim();

  if (!name) {
    alert('Please enter a traveler name');
    return;
  }

  addTravelerToFirebase({ name }); // Add traveler to Firebase
  document.getElementById('new-traveler-name').value = ''; // Clear input field
});

// Listen for real-time traveler updates
onValue(ref(db, 'travelers'), (snapshot) => {
  travelers = [];

  snapshot.forEach((childSnapshot) => {
    const traveler = childSnapshot.val();
    traveler.key = childSnapshot.key; // Store the key for deletion (if needed later)
    travelers.push(traveler);
  });

  updateUI(); // Update the UI when data changes
});

// Manage Travelers Modal
document.getElementById('manage-travelers').addEventListener('click', () => {
  modal.classList.remove('hidden'); // Show modal
});

// Event Listener for Close Modal button
document.getElementById('close-modal').addEventListener('click', () => {
  modal.classList.add('hidden'); // Hide modal
});
