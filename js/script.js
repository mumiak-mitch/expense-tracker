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
        const expenseList = document.getElementById('expense-list');
        expenseList.innerHTML = ''; // Clear the existing list
    
        expenses.forEach((expense, index) => {
            const row = document.createElement('tr');
    
            // Expense name
            const nameCell = document.createElement('td');
            nameCell.textContent = expense.description;
            row.appendChild(nameCell);
    
            // Expense amount
            const amountCell = document.createElement('td');
            amountCell.textContent = `$${expense.amount.toFixed(2)}`;
            row.appendChild(amountCell);
    
            // Action buttons
            const actionCell = document.createElement('td');
            const actionDiv = document.createElement('div');
            actionDiv.className = 'action-buttons';
    
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit-btn';
            editButton.onclick = () => editExpense(index);
    
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-btn';
            deleteButton.onclick = () => removeExpense(index);
    
            actionDiv.appendChild(editButton);
            actionDiv.appendChild(deleteButton);
            actionCell.appendChild(actionDiv);
            row.appendChild(actionCell);
    
            // Append the row to the expense list (table body)
            expenseList.appendChild(row);
        });
    
        renderChart();
        updateBalance();
    }    

    function renderChart() {
        const labels = expenses.map(expense => `${expense.description} (${expense.category})`);
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
        const newDescription = prompt('Enter new name:', expense.description);
        const newCategory = prompt('Enter new category:', expense.category);
        const newAmount = parseFloat(prompt('Enter new amount:', expense.amount));
        if (newDescription && newCategory && !isNaN(newAmount) && newAmount > 0) {
            expenses[index] = { description: newDescription, category: newCategory, amount: newAmount };
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
        const category = document.getElementById('category').value;
        const amount = parseFloat(document.getElementById('amount').value);

        if (description && category && !isNaN(amount) && amount > 0) {
            expenses.push({ description, category, amount });
            localStorage.setItem('expenses', JSON.stringify(expenses));
            expenseForm.reset();
            renderExpenses();
        } else {
            alert('Please provide valid inputs.');
        }
    });

    // Initial rendering
    updateIncomeDisplay();
    renderExpenses();
});
