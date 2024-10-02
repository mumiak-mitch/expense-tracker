document.addEventListener('DOMContentLoaded', () => {
    const incomeForm = document.getElementById('income-form');
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const expenseChart = document.getElementById('expense-chart').getContext('2d');
    const totalIncomeElement = document.getElementById('total-income');
    const totalBalanceElement = document.getElementById('total-balance');

    let totalIncome = JSON.parse(localStorage.getItem('totalIncome')) || { main: 0, side: 0 };
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    function calculateTotalIncome() {
        return totalIncome.main + totalIncome.side;
    }

    function updateIncomeDisplay() {
        const income = calculateTotalIncome();
        totalIncomeElement.textContent = `$${income.toFixed(2)}`;
    }

    function updateBalance() {
        const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalBalance = calculateTotalIncome() - totalExpense;
        totalBalanceElement.textContent = `$${totalBalance.toFixed(2)}`;
    }

    function renderExpenses() {
        expenseList.innerHTML = '';
        expenses.forEach((expense, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.innerHTML = `
                ${expense.description} - $${expense.amount.toFixed(2)}
                <div>
                    <button class="btn btn-warning btn-sm me-2" onclick="editExpense(${index})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="removeExpense(${index})">Remove</button>
                </div>
            `;
            expenseList.appendChild(listItem);
        });
        renderChart();
        updateBalance();
    }

    function renderChart() {
        const labels = expenses.map(expense => expense.description);
        const data = expenses.map(expense => expense.amount);

        // Destroy existing chart instance if it exists to prevent duplication
        if (window.expenseChartInstance) {
            window.expenseChartInstance.destroy();
        }

        window.expenseChartInstance = new Chart(expenseChart, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Expenses',
                    data: data,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56',
                        '#4BC0C0', '#9966FF', '#FF9F40',
                        '#FFCD56', '#C9CBCF', '#36A2EB',
                    ],
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': $' + context.raw.toFixed(2);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    window.removeExpense = function(index) {
        if (confirm('Are you sure you want to delete this expense?')) {
            expenses.splice(index, 1);
            localStorage.setItem('expenses', JSON.stringify(expenses));
            renderExpenses();
        }
    }

    window.editExpense = function(index) {
        const expense = expenses[index];
        const newDescription = prompt('Enter new description:', expense.description);
        const newAmount = parseFloat(prompt('Enter new amount:', expense.amount));
        if (newDescription && !isNaN(newAmount) && newAmount > 0) {
            expenses[index] = { description: newDescription, amount: newAmount };
            localStorage.setItem('expenses', JSON.stringify(expenses));
            renderExpenses();
        } else {
            alert('Invalid input. Please try again.');
        }
    }

    incomeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const mainIncome = parseFloat(document.getElementById('main-income').value);
        const sideIncome = parseFloat(document.getElementById('side-income').value);

        if (!isNaN(mainIncome) && mainIncome >= 0 && !isNaN(sideIncome) && sideIncome >= 0) {
            totalIncome.main = mainIncome;
            totalIncome.side = sideIncome;
            localStorage.setItem('totalIncome', JSON.stringify(totalIncome));
            incomeForm.reset();
            updateIncomeDisplay();
            updateBalance();
        } else {
            alert('Please provide valid income values.');
        }
    });

    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const description = document.getElementById('description').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);

        if (description && !isNaN(amount) && amount > 0) {
            expenses.push({ description, amount });
            localStorage.setItem('expenses', JSON.stringify(expenses));
            expenseForm.reset();
            renderExpenses();
        } else {
            alert('Please provide a valid description and amount.');
        }
    });

    // Initial rendering
    updateIncomeDisplay();
    renderExpenses();
});
