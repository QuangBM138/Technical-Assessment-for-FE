<template>
    <div>
        <table class="table">
            <thead>
                <tr>
                    <th class="col-checkbox">
                        <input type="checkbox" @change="toggleSelectAll" />
                    </th>
                    <th class="col-name">Name</th>
                    <th class="col-balance">Balance($)</th>
                    <th class="col-email">Email</th>
                    <th class="col-registration">Registration</th>
                    <th class="col-status">Status</th>
                    <th class="col-action">Action</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in paginatedUsers" :key="user.id">
                    <td class="col-checkbox">
                        <input type="checkbox" v-model="selectedUsers" :value="user.id" />
                    </td>
                    <td class="col-name">{{ user.name }}</td>
                    <td class="col-balance">{{ formatBalance(user.balance) }}</td>
                    <td class="col-email">
                        <a :href="`mailto:${user.email}`">{{ user.email }}</a>
                    </td>
                    <td class="col-registration">
                        <span :title="user.registerAt.toLocaleString()">
                            {{ formatDate(user.registerAt) }}
                        </span>
                    </td>
                    <td class="col-status">
                        <button :class="['status-button', user.active ? 'active' : 'inactive']">
                            Status
                        </button>
                    </td>
                    <td class="col-action">
                        <Icon icon="material-symbols:edit-outline" class="action-icon edit-icon"
                            @click="editUser(user.id)" />
                        <Icon icon="material-symbols:delete-outline" class="action-icon delete-icon"
                            @click="deleteUser(user.id)" />
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
import Swal from 'sweetalert2';
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';

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
    Array.from({ length: 106 }, (_, i) => ({
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
    const maxVisible = 6;
    const totalPagesCount = totalPages.value;

    if (totalPagesCount <= maxVisible) {
        for (let i = 1; i <= totalPagesCount; i++) {
            pages.push(i);
        }
    } else {
        if (currentPage.value <= 3) {
            pages.push(1, 2, 3, 4, '...', totalPagesCount - 1, totalPagesCount);
        } else if (currentPage.value >= totalPagesCount - 2) {
            pages.push(1, 2, '...', totalPagesCount - 3, totalPagesCount - 2, totalPagesCount - 1, totalPagesCount);
        } else {
            pages.push(1, 2, '...', currentPage.value - 1, currentPage.value, currentPage.value + 1, '...', totalPagesCount - 1, totalPagesCount);
        }
    }

    return pages;
});

// Action handlers
const editUser = (userId: string) => {
    const user = users.value.find(user => user.id === userId);
    if (user) {
        Swal.fire({
            title: 'Edit User',
            html: `
                <div style="text-align: left;">
                    <label for="edit-name">Name:</label>
                    <input id="edit-name" class="swal2-input" value="${user.name}" />
                    
                    <label for="edit-email">Email:</label>
                    <input id="edit-email" class="swal2-input" value="${user.email}" />
                    
                    <label for="edit-balance">Balance:</label>
                    <input id="edit-balance" type="number" class="swal2-input" value="${user.balance}" />
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Save',
            cancelButtonText: 'Cancel',
            preConfirm: () => {
                const name = (document.getElementById('edit-name') as HTMLInputElement).value;
                const email = (document.getElementById('edit-email') as HTMLInputElement).value;
                const balance = parseFloat((document.getElementById('edit-balance') as HTMLInputElement).value);

                if (!name || !email || isNaN(balance)) {
                    Swal.showValidationMessage('Please fill out all fields correctly.');
                    return null;
                }
                return { name, email, balance };
            },
        }).then(result => {
            if (result.isConfirmed && result.value) {
                // Cập nhật dữ liệu người dùng
                user.name = result.value.name;
                user.email = result.value.email;
                user.balance = result.value.balance;

                Swal.fire({
                    title: 'Updated!',
                    text: `${user.name}'s information has been updated.`,
                    icon: 'success',
                    confirmButtonText: 'OK',
                });
            }
        });
    }
};

const deleteUser = (userId: string) => {
    const user = users.value.find(user => user.id === userId);
    if (user) {
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete user: ${user.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete it!',
        }).then(result => {
            if (result.isConfirmed) {
                users.value = users.value.filter(user => user.id !== userId);
                Swal.fire({
                    title: 'Deleted!',
                    text: `${user.name} has been deleted.`,
                    icon: 'success',
                    confirmButtonText: 'OK',
                });
            }
        });
    }
};

// Formatters
const formatBalance = (balance: number) => `$${balance.toLocaleString()}`;
const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Thêm số 0 nếu cần
    const day = String(date.getDate()).padStart(2, '0'); // Thêm số 0 nếu cần
    return `${year}-${month}-${day}`;
};
</script>

<style scoped>
/* Table styles */
.table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
    font-family: 'Roboto', sans-serif;
}

.table th,
.table td {
    padding: 8px;
    text-align: left;
    background-color: #f8fafb;
}

.table th {
    background-color: #ffffff;
    font-weight: bold;
}

/* Column-specific styles */
.col-checkbox {
    width: 2%;
    text-align: center;
}

.col-name {
    width: 15%;
}

.col-balance {
    width: 15%;
    text-align: right;
}

.col-email {
    width: 25%;
}

.col-registration {
    width: 15%;
}

.col-status {
    width: 20%;
    text-align: center;
}

.col-action {
    width: 8%;
    text-align: center;
}

/* Checkbox styles */
input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    margin: 0;
}

/* Email link styles */
a {
    text-decoration: none;
    color: inherit;
    transition: color 0.3s ease, background-color 0.3s ease;
}

a:hover {
    background-color: #93ffe0;
    color: #f0f8ff;
    border-radius: 4px;
    padding: 2px 4px;
}

/* Status button styles */
.status-button {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border: 1px solid #ccc;
    border-radius: 20px;
    background-color: transparent;
    color: #333;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: default;
    text-align: center;
    outline: none;
}

.status-button.active {
    border-color: #28a745;
    color: #28a745;
}

.status-button.inactive {
    border-color: #dc3545;
    color: #dc3545;
}

/* Action icon styles */
.action-icon {
    font-size: 20px;
    cursor: pointer;
    margin-right: 10px;
    color: inherit;
    transition: color 0.3s ease;
}

.edit-icon:hover {
    color: #007bff;
    /* Màu xanh cho biểu tượng chỉnh sửa */
}

.delete-icon:hover {
    color: #dc3545;
    /* Màu đỏ cho biểu tượng xóa */
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