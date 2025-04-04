<template>
    <div>
        <table>
            <thead>
                <tr>
                    <th>
                        <input type="checkbox" @change="toggleSelectAll" />
                    </th>
                    <th>Name</th>
                    <th>Balance($)</th>
                    <th>Email</th>
                    <th>Registration</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in paginatedUsers" :key="user.id">
                    <td>
                        <input type="checkbox" v-model="selectedUsers" :value="user.id" />
                    </td>
                    <td>{{ user.name }}</td>
                    <td>{{ formatBalance(user.balance) }}</td>
                    <td>
                        <a :href="`mailto:${user.email}`">{{ user.email }}</a>
                    </td>
                    <td>
                        <span :title="user.registerAt.toLocaleString()">
                            {{ formatDate(user.registerAt) }}
                        </span>
                    </td>
                    <td>
                        <span :class="['status-badge', user.active ? 'active' : 'inactive']">
                            {{ user.active ? 'Active' : 'Inactive' }}
                        </span>
                    </td>
                    <td>
                        <button @click="editUser(user.id)" class="action-btn edit-btn">Edit</button>
                        <button @click="deleteUser(user.id)" class="action-btn delete-btn">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Pagination Controls -->
        <div class="pagination">
            <div class="results-count">{{ users.length }} results</div>
            <div class="pagination-controls">
                <button @click="currentPage--" :disabled="currentPage === 1">&lt;</button>
                <span v-for="page in visiblePages" :key="page">
                    <button v-if="page !== '...'" :class="{ active: page === currentPage }"
                        @click="currentPage = Number(page)">
                        {{ page }}
                    </button>
                    <span v-else>...</span>
                </span>
                <button @click="currentPage++" :disabled="currentPage === totalPages">&gt;</button>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface TUser {
    id: string;
    name: string;
    balance: number;
    email: string;
    registerAt: Date;
    active: boolean;
}

// Generate sample data
const users = ref<TUser[]>(
    Array.from({ length: 105 }, (_, i) => ({
        id: `user-${i + 1}`,
        name: `User ${i + 1}`,
        balance: Math.floor(Math.random() * 100000) / 100,
        email: `user${i + 1}@example.com`,
        registerAt: new Date(Date.now() - Math.random() * 10000000000),
        active: Math.random() > 0.5,
    }))
);

// Pagination state
const rowsPerPage = ref(10);
const currentPage = ref(1);

const totalPages = computed(() => Math.ceil(users.value.length / rowsPerPage.value));

const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * rowsPerPage.value;
    return users.value.slice(start, start + rowsPerPage.value);
});

// Selected users state
const selectedUsers = ref<string[]>([]);

const toggleSelectAll = (event: Event) => {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
        selectedUsers.value = paginatedUsers.value.map(user => user.id);
    } else {
        selectedUsers.value = [];
    }
};

// Pagination logic for visible pages
const visiblePages = computed(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages.value <= maxVisible) {
        for (let i = 1; i <= totalPages.value; i++) {
            pages.push(i);
        }
    } else {
        if (currentPage.value <= 3) {
            pages.push(1, 2, 3, 4, '...', totalPages.value);
        } else if (currentPage.value >= totalPages.value - 2) {
            pages.push(1, '...', totalPages.value - 3, totalPages.value - 2, totalPages.value - 1, totalPages.value);
        } else {
            pages.push(1, '...', currentPage.value - 1, currentPage.value, currentPage.value + 1, '...', totalPages.value);
        }
    }

    return pages;
});

// Action handlers
const editUser = (userId: string) => {
    alert(`Edit user with ID: ${userId}`);
};

const deleteUser = (userId: string) => {
    if (confirm(`Are you sure you want to delete user with ID: ${userId}?`)) {
        users.value = users.value.filter(user => user.id !== userId);
    }
};

// Formatters
const formatBalance = (balance: number) => `$${balance.toLocaleString()}`;
const formatDate = (date: Date) => date.toISOString().split('T')[0];
</script>

<style scoped>
table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
}

th,
td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

th {
    background-color: #f4f4f4;
}

.status-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    color: #fff;
    font-size: 0.875rem;
    text-align: center;
}

.status-badge.active {
    background-color: #28a745;
    /* Green for active */
}

.status-badge.inactive {
    background-color: #dc3545;
    /* Red for inactive */
}

.action-btn {
    padding: 0.25rem 0.5rem;
    margin-right: 0.5rem;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
}

.edit-btn {
    background-color: #007bff;
    color: #fff;
}

.delete-btn {
    background-color: #dc3545;
    color: #fff;
}

.pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
}

.results-count {
    font-size: 0.875rem;
    color: #555;
}

.pagination-controls {
    display: flex;
    align-items: center;
}

.pagination-controls button {
    margin: 0 0.25rem;
    padding: 0.25rem 0.5rem;
    border: 1px solid #ddd;
    background-color: #fff;
    cursor: pointer;
}

.pagination-controls button.active {
    background-color: #007bff;
    color: #fff;
    border-color: #007bff;
}

.pagination-controls button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>