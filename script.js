let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const transactionList = document.getElementById("transaction-list");
const balanceDisplay = document.getElementById("total-balance");
const incomeDisplay = document.getElementById("total-income");
const expenseDisplay = document.getElementById("total-expense");
const financeForm = document.getElementById("finance-form");
const clearBtn = document.getElementById("clear-all");

let myChart;

// 1. Update Angka-angka di Dashboard
function updateValues() {
  const amounts = transactions.map((t) => t.amount);

  const total = amounts.reduce((acc, item) => (acc += item), 0);
  const income = amounts
    .filter((item) => item > 0)
    .reduce((acc, item) => (acc += item), 0);
  const expense =
    amounts.filter((item) => item < 0).reduce((acc, item) => (acc += item), 0) *
    -1;

  balanceDisplay.innerText = `Rp ${total.toLocaleString("id-ID")}`;
  incomeDisplay.innerText = `Rp ${income.toLocaleString("id-ID")}`;
  expenseDisplay.innerText = `Rp ${expense.toLocaleString("id-ID")}`;

  updateChart();
}

// 2. Render List Riwayat
function renderTransactions() {
  transactionList.innerHTML = "";
  transactions.forEach((transaction, index) => {
    const item = document.createElement("li");
    item.classList.add("transaction-item");

    // Cek apakah income atau expense untuk warna teks
    const sign = transaction.amount < 0 ? "-" : "+";
    const statusClass = transaction.amount < 0 ? "amount-out" : "amount-in";

    item.innerHTML = `
            <div>
                <strong>${transaction.description}</strong> <br>
                <small>${transaction.category}</small>
            </div>
            <div>
                <span class="${statusClass}">${sign} Rp ${Math.abs(transaction.amount).toLocaleString("id-ID")}</span>
                <button onclick="removeTransaction(${index})" style="background:none; border:none; color:red; cursor:pointer; margin-left:10px;">x</button>
            </div>
        `;
    transactionList.appendChild(item);
  });
}

// 3. Tambah Data Baru
financeForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const description = document.getElementById("description").value;
  const amount = parseInt(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const type = document.getElementById("type").value;

  // Logika IS: Jika income jadi positif, jika expense jadi negatif
  const finalAmount = type === "income" ? amount : -amount;

  const newTransaction = {
    description,
    amount: finalAmount,
    category,
  };

  transactions.push(newTransaction);
  saveAndInit();
  financeForm.reset();
});

// 4. Hapus Per Item & Semua
function removeTransaction(index) {
  transactions.splice(index, 1);
  saveAndInit();
}

clearBtn.addEventListener("click", () => {
  if (confirm("Yakin ingin hapus semua data?")) {
    transactions = [];
    saveAndInit();
  }
});

// 5. Update Chart (Hanya untuk Pengeluaran agar grafik informatif)
function updateChart() {
  const categories = ["makan", "transport", "hobby", "kuliah"];
  const dataByCat = categories.map((cat) => {
    return transactions
      .filter((t) => t.category === cat && t.amount < 0) // Hanya hitung yang minus
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  });

  const ctx = document.getElementById("expenseChart").getContext("2d");
  if (myChart) myChart.destroy();

  myChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: categories.map((c) => c.charAt(0).toUpperCase() + c.slice(1)),
      datasets: [
        {
          data: dataByCat,
          backgroundColor: ["#4361ee", "#2ec4b6", "#ff9f1c", "#e71d36"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } },
    },
  });
}

function saveAndInit() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions();
  updateValues();
}

// Inisialisasi awal
saveAndInit();
