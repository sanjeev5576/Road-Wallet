// Firebase Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, push, set, onValue, remove, } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyChBJskPokDf3HDEgZ2Nv2IuqI-4KV6QOA",
  authDomain: "road-wallet-app-9251d.firebaseapp.com",
  databaseURL: "https://road-wallet-app-9251d-default-rtdb.firebaseio.com",
  projectId: "road-wallet-app-9251d",
  storageBucket: "road-wallet-app-9251d.appspot.com",
  messagingSenderId: "833971521374",
  appId: "1:833971521374:web:1bbf1ae8bb752951c8f1cf",
  measurementId: "G-D7D66DD6Y2",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// DOM Elements
const loginSection = document.getElementById("login-section");
const expensesSection = document.getElementById("expenses-section");
const manageTravelersPopup = document.getElementById("manage-travelers-popup");

const totalExpensesElem = document.getElementById("total-expenses");
const expenseListElem = document.getElementById("expense-list");
const travelerListElem = document.getElementById("traveler-list");
const manageTravelerBtn = document.getElementById("manage-travelers-btn");

let currentUser = null;
let totalExpenses = 0;
let travelers = [];
let expenses = [];

// Login Event
document.getElementById("login-button").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      loginSection.classList.add("hidden");
      expensesSection.classList.remove("hidden");
      manageTravelerBtn.classList.remove("hidden");

      fetchExpenses();
      fetchTravelers();
    })
    .catch((error) => {
      alert("Login failed: " + error.message);
    });
});

// Sign Up Event
document.getElementById("signup-button").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Account created successfully!");
    })
    .catch((error) => {
      alert("Signup failed: " + error.message);
    });
});

// Fetch Expenses
function fetchExpenses() {
  if (!currentUser) return;

  const expenseRef = ref(database, `users/${currentUser.uid}/expenses`);
  onValue(expenseRef, (snapshot) => {
    expenses = [];
    totalExpenses = 0;

    snapshot.forEach((childSnapshot) => {
      const expense = { key: childSnapshot.key, ...childSnapshot.val() };
      expenses.push(expense);
      totalExpenses += expense.amount;
    });

    updateUI();
  });
}

// Fetch Travelers
function fetchTravelers() {
  if (!currentUser) return;

  const travelerRef = ref(database, `users/${currentUser.uid}/travelers`);
  onValue(travelerRef, (snapshot) => {
    travelers = [];

    snapshot.forEach((childSnapshot) => {
      const traveler = { key: childSnapshot.key, ...childSnapshot.val() };
      travelers.push(traveler);
    });

    updateTravelersUI();
  });
}

// Add Expense
document.getElementById("add-expense").addEventListener("click", () => {
  const name = document.getElementById("expense-name").value.trim();
  const amount = parseFloat(document.getElementById("expense-amount").value.trim());
  const category = document.getElementById("expense-category").value;

  if (!name || isNaN(amount)) {
    alert("Invalid expense details");
    return;
  }

  const expenseRef = ref(database, `users/${currentUser.uid}/expenses`);
  const newExpenseRef = push(expenseRef);
  set(newExpenseRef, { name, amount, category });

  document.getElementById("expense-name").value = "";
  document.getElementById("expense-amount").value = "";
});

// Add Traveler
document.getElementById("add-traveler").addEventListener("click", () => {
  const name = document.getElementById("new-traveler-name").value.trim();

  if (!name) {
    alert("Invalid traveler name");
    return;
  }

  const travelerRef = ref(database, `users/${currentUser.uid}/travelers`);
  const newTravelerRef = push(travelerRef);
  set(newTravelerRef, { name });

  document.getElementById("new-traveler-name").value = "";
});

// Remove Expense
function removeExpenseFromFirebase(key) {
  const expenseRef = ref(database, `users/${currentUser.uid}/expenses/${key}`);
  remove(expenseRef);
}

// Remove Traveler
function removeTravelerFromFirebase(key) {
  const travelerRef = ref(database, `users/${currentUser.uid}/travelers/${key}`);
  remove(travelerRef);
}

// Open Manage Travelers Popup
document.getElementById("manage-travelers-btn").addEventListener("click", () => {
  manageTravelersPopup.classList.remove("hidden");
});

// Close Manage Travelers Popup
document.getElementById("close-popup").addEventListener("click", () => {
  manageTravelersPopup.classList.add("hidden");
});

// Update Expenses UI
function updateUI() {
  totalExpensesElem.textContent = `Rs ${totalExpenses.toFixed(2)}`;
  expenseListElem.innerHTML = expenses
    .map(
      (expense) => `
    <li>
      ${expense.name} - ${expense.category}: Rs ${expense.amount.toFixed(2)}
      <button onclick="removeExpenseFromFirebase('${expense.key}')">🗑️</button>
    </li>`
    )
    .join("");
}

// Update Travelers Popup UI
function updateTravelersUI() {
  if (travelers.length > 0) {
    travelerListElem.innerHTML = travelers
      .map(
        (traveler) => `
      <li>
        ${traveler.name}: Rs ${(totalExpenses / travelers.length).toFixed(2)}
        <button onclick="removeTravelerFromFirebase('${traveler.key}')">❌</button>
      </li>`
      )
      .join("");
  } else {
    travelerListElem.innerHTML = `<p>No travelers added yet.</p>`;
  }
}

// Logout
document.getElementById("logout-button").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      currentUser = null;
      loginSection.classList.remove("hidden");
      expensesSection.classList.add("hidden");
      manageTravelersPopup.classList.add("hidden");

      expenses = [];
      travelers = [];
      updateUI();
      updateTravelersUI();
    })
    .catch((error) => {
      alert("Logout failed: " + error.message);
    });
});
