<template>
    <div>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Balance</th>
                    <th>Email</th>
                    <th>Registration Date</th>
                    <th>Active</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in paginatedUsers" :key="user.id">
                    <td>{{ user.id }}</td>
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
                    <td>{{ user.active ? 'Yes' : 'No' }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Pagination Controls -->
        <div class="pagination">
            <button @click="currentPage--" :disabled="currentPage === 1">Previous</button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="currentPage++" :disabled="currentPage === totalPages">Next</button>
        </div>

        <!-- Rows Per Page Selector -->
        <div>
            <label for="rowsPerPage">Rows per page:</label>
            <select id="rowsPerPage" v-model="rowsPerPage">
                <option :value="5">5</option>
                <option :value="10">10</option>
                <option :value="20">20</option>
            </select>
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
    Array.from({ length: 100 }, (_, i) => ({
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

.pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>