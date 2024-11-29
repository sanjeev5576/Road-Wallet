// Firebase Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, push, set, remove, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Your Firebase configuration
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
const database = getDatabase(app);

// State variables
let travelers = [];
let expenses = [];
let totalExpenses = 0;

// DOM elements
const totalExpensesElem = document.getElementById('total-expenses');
const expenseListElem = document.getElementById('expense-list');
const travelerListElem = document.getElementById('traveler-list');
const modal = document.getElementById('traveler-modal');

// Function to update the UI
function updateUI() {
  // Update total expenses
  totalExpensesElem.textContent = `Rs ${totalExpenses.toFixed(2)}`;

  // Sort expenses by timestamp in descending order
  expenses.sort((a, b) => b.timestamp - a.timestamp);

  // Render expense list
  expenseListElem.innerHTML = expenses.map((expense) => `
    <li>
      ${expense.name} - ${expense.category}: Rs ${expense.amount.toFixed(2)}
      <button class="remove-btn" data-id="${expense.key}">Remove</button>
    </li>
  `).join('');

  // Add event listeners to expense "Remove" buttons
  document.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', () => {
      const expenseKey = button.getAttribute('data-id');
      removeExpenseFromFirebase(expenseKey);
    });
  });

  // Render traveler cost shares
  if (travelers.length > 0) {
    travelerListElem.innerHTML = travelers.map((traveler) => `
      <li>
        <strong>${traveler.name}</strong>: Rs ${(totalExpenses / travelers.length).toFixed(2)}
        <button class="remove-traveler-btn" data-id="${traveler.key}"> <i class="fas fa-times"></i></button>
      </li>
    `).join('');
  } else {
    travelerListElem.innerHTML = `<p>No travelers added yet.</p>`;
  }

  // Add event listeners to traveler "Remove" buttons
  document.querySelectorAll('.remove-traveler-btn').forEach(button => {
    button.addEventListener('click', () => {
      const travelerKey = button.getAttribute('data-id');
      removeTraveler(travelerKey);
    });
  });
}

// Function to add expense to Firebase
function addExpense(name, amount, category) {
  const expenseRef = ref(database, 'expenses');
  const newExpense = push(expenseRef);

  set(newExpense, {
    name,
    amount,
    category,
    timestamp: Date.now(),
  }).then(() => {
    console.log("Expense added successfully.");
  }).catch((error) => {
    console.error("Error adding expense: ", error);
  });
}

// Function to remove expense from Firebase
function removeExpenseFromFirebase(expenseKey) {
  const expenseRef = ref(database, `expenses/${expenseKey}`);
  remove(expenseRef)
    .then(() => {
      console.log("Expense removed successfully.");
    })
    .catch((error) => {
      console.error("Error removing expense: ", error);
    });
}

// Function to add traveler to Firebase
function addTraveler(name) {
  const travelerRef = ref(database, 'travelers');
  const newTraveler = push(travelerRef);

  set(newTraveler, { name })
    .then(() => {
      console.log("Traveler added successfully.");
    })
    .catch((error) => {
      console.error("Error adding traveler: ", error);
    });
}

// Function to remove traveler from Firebase
function removeTraveler(travelerKey) {
  const travelerRef = ref(database, `travelers/${travelerKey}`);
  remove(travelerRef)
    .then(() => {
      console.log("Traveler removed successfully.");
    })
    .catch((error) => {
      console.error("Error removing traveler: ", error);
    });
}

// Manage Travelers Modal
document.getElementById('manage-travelers').addEventListener('click', () => {
  modal.classList.remove('hidden'); // Show modal
});

// Event Listener for Close Modal button
document.getElementById('close-modal').addEventListener('click', () => {
  modal.classList.add('hidden'); // Hide modal
});

// Event Listener for Add Expense button
document.getElementById('add-expense').addEventListener('click', () => {
  const name = document.getElementById('expense-name').value.trim();
  const amount = parseFloat(document.getElementById('expense-amount').value.trim());
  const category = document.getElementById('expense-category').value;

  if (!name || isNaN(amount)) {
    alert('Please enter valid expense details.');
    return;
  }

  addExpense(name, amount, category);
  document.getElementById('expense-name').value = '';
  document.getElementById('expense-amount').value = '';
});

// Event Listener for Add Traveler button
document.getElementById('add-traveler').addEventListener('click', () => {
  const name = document.getElementById('new-traveler-name').value.trim();

  if (!name) {
    alert('Please enter a traveler name.');
    return;
  }

  addTraveler(name);
  document.getElementById('new-traveler-name').value = '';
});

// Firebase: Real-time updates for expenses and travelers
const expensesRef = ref(database, 'expenses');
onValue(expensesRef, (snapshot) => {
  expenses = [];
  snapshot.forEach((childSnapshot) => {
    const expense = childSnapshot.val();
    expenses.push({ ...expense, key: childSnapshot.key });
  });
  totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  updateUI();
});

const travelersRef = ref(database, 'travelers');
onValue(travelersRef, (snapshot) => {
  travelers = [];
  snapshot.forEach((childSnapshot) => {
    const traveler = childSnapshot.val();
    travelers.push({ ...traveler, key: childSnapshot.key });
  });
  updateUI();
});
