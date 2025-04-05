<template>
    <div v-if="isLoading" class="loading-spinner">
        <Icon icon="eos-icons:bubble-loading" class="spinner" />
    </div>
    <div v-if="!isLoading && !errorMessage">

        <div class="filter-container">
            <!-- Search Input -->
            <div class="filter-input-wrapper">
                <input type="text" v-model="filterQuery" placeholder="Search by name or email..."
                    class="filter-input" />
                <Icon icon="material-symbols:close" class="clear-icon" v-if="filterQuery" @click="clearSearch" />
            </div>



            <div class="icon-container">
                <div :title="(isInfiniteScroll ? 'Pagination' : 'Infinite Scroll')">
                    <Icon icon="ph:mouse-scroll" class="mode-toggle-button" @click="toggleMode" />
                </div>

                <div :title="` ${isDarkMode ? 'Light' : 'Dark'} mode`">
                    <!-- Dark Mode Toggle -->
                    <Icon :icon="isDarkMode ? 'material-symbols:light-mode' : 'material-symbols:dark-mode'"
                        class="toggle-icon" @click="toggleDarkMode" />
                </div>
            </div>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th class="col-checkbox">
                        <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
                    </th>
                    <th class="col-name">
                        Name
                        <Icon :icon="getSortIcon('name')" class="sort-icon" @click="sortTable('name')" />
                    </th>
                    <th class="col-balance">
                        Balance
                        <Icon :icon="getSortIcon('balance')" class="sort-icon" @click="sortTable('balance')" />
                    </th>
                    <th class="col-email">
                        Email
                        <Icon :icon="getSortIcon('email')" class="sort-icon" @click="sortTable('email')" />
                    </th>
                    <th class="col-registration">
                        Registration
                        <Icon :icon="getSortIcon('registerAt')" class="sort-icon" @click="sortTable('registerAt')" />
                    </th>
                    <th class="col-status">
                        Status
                        <Icon :icon="getSortIcon('active')" class="sort-icon" @click="sortTable('active')" />
                    </th>
                    <th class="col-action">Action</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in (isInfiniteScroll ? visibleUsers : paginatedUsers)" :key="user.id">
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
            <!-- Sentinel for infinite scroll -->
            <div v-if="isInfiniteScroll" ref="sentinel" class="sentinel"></div>
        </table>

        <!-- Pagination Controls -->
        <div class="pagination" v-if="!isInfiniteScroll">
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { Icon } from '@iconify/vue';
import { watch } from 'vue';


interface TUser {
    id: string;
    name: string;
    balance: number;
    email: string;
    registerAt: Date;
    active: boolean;
}

// State
const users = ref<TUser[]>([]);
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

// Fetch data từ mock API
const fetchUsers = async () => {
    isLoading.value = true;
    errorMessage.value = null;

    try {
        const response = await fetch('https://67f1121fc733555e24ac15eb.mockapi.io/api/users/users');
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        // Map dữ liệu từ API sang định dạng TUser
        users.value = data.map((user: any) => ({
            id: user.id,
            name: user.name,
            balance: parseFloat(user.balance),
            email: user.email,
            registerAt: new Date(user.registerAt * 1000), // Chuyển timestamp thành Date
            active: user.active,
        }));
    } catch (error: any) {
        errorMessage.value = error.message || 'Failed to fetch data.';
    } finally {
        isLoading.value = false; // Ẩn spinner
    }
};

// Pagination state
const rowsPerPage = ref(10);
const currentPage = ref(1);

const totalPages = computed(() => Math.ceil(users.value.length / rowsPerPage.value));

const filterQuery = ref<string>('');

const filteredUsers = computed(() => {
    let result = users.value;

    // Apply filtering
    if (filterQuery.value) {
        const query = filterQuery.value.toLowerCase();
        result = result.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );
    }

    // Apply sorting
    if (sortKey.value) {
        result = [...result].sort((a, b) => {
            const aValue = a[sortKey.value as keyof TUser];
            const bValue = b[sortKey.value as keyof TUser];

            // Natural sorting for strings
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortOrder.value === 'asc'
                    ? aValue.localeCompare(bValue, undefined, { numeric: true })
                    : bValue.localeCompare(aValue, undefined, { numeric: true });
            }

            // Regular sorting for numbers or other types
            if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1;
            return 0;
        });
    }

    updateVisibleUsers(); // Cập nhật danh sách hiển thị
    return result;
});

const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * rowsPerPage.value;
    return filteredUsers.value.slice(start, start + rowsPerPage.value);
});

// Selected users state
const selectedUsers = ref<string[]>([]);

const toggleSelectAll = (event: Event) => {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isInfiniteScroll.value) {
        // Chọn tất cả người dùng hiển thị trong chế độ Infinite Scroll
        if (isChecked) {
            selectedUsers.value = visibleUsers.value.map(user => user.id);
        } else {
            selectedUsers.value = [];
        }
    } else {
        // Chọn tất cả người dùng hiển thị trong chế độ Pagination
        if (isChecked) {
            selectedUsers.value = paginatedUsers.value.map(user => user.id);
        } else {
            selectedUsers.value = [];
        }
    }
};

const isAllSelected = computed(() => {
    if (isInfiniteScroll.value) {
        return visibleUsers.value.every(user => selectedUsers.value.includes(user.id));
    } else {
        return paginatedUsers.value.every(user => selectedUsers.value.includes(user.id));
    }
});

// Sorting state
const sortKey = ref<string | null>(null);
const sortOrder = ref<'asc' | 'desc'>('asc');

const getSortIcon = (key: string) => {
    if (sortKey.value === key) {
        return sortOrder.value === 'asc'
            ? 'material-symbols:arrow-upward'
            : 'material-symbols:arrow-downward';
    }
    return 'flowbite:sort-outline';
};

const sortTable = (key: string) => {
    if (sortKey.value === key) {
        // Toggle sort order
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
        // Set new sort key and default to ascending order
        sortKey.value = key;
        sortOrder.value = 'asc';
    }
    updateVisibleUsers();
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
                    
                    <label for="edit-active">Active:</label>
                    <input id="edit-active" type="checkbox" ${user.active ? 'checked' : ''} />
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
                const active = (document.getElementById('edit-active') as HTMLInputElement).checked;

                if (!name || !email || isNaN(balance)) {
                    Swal.showValidationMessage('Please fill out all fields correctly.');
                    return null;
                }
                return { name, email, balance, active };
            },
        }).then(result => {
            if (result.isConfirmed && result.value) {
                // Cập nhật dữ liệu người dùng
                user.name = result.value.name;
                user.email = result.value.email;
                user.balance = result.value.balance;
                user.active = result.value.active;

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
                // updateVisibleUsers(); // Cập nhật danh sách hiển thị

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

// Clear search query
const clearSearch = () => {
    filterQuery.value = '';
};

// Dark mode state
const isDarkMode = ref(false);

const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
    document.body.classList.toggle('dark-mode', isDarkMode.value);
    localStorage.setItem('darkMode', isDarkMode.value.toString());
};


const isInfiniteScroll = ref(false); // Trạng thái chế độ (mặc định là phân trang)

// Infinite scroll observer// Infinite scroll observer
let observer: IntersectionObserver | null = null;

const visibleUsers = ref<TUser[]>([]);

const setupObserver = () => {
    const sentinel = document.querySelector('.sentinel');
    if (!sentinel) return;

    observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting) {
                loadMoreUsers();
            }
        },
        {
            root: null, // Sử dụng viewport làm root
            rootMargin: '0px', // Kích hoạt ngay khi sentinel vào viewport
            threshold: 1.0, // Yêu cầu sentinel hoàn toàn hiển thị để kích hoạt
        }
    );

    observer.observe(sentinel);
};

const loadMoreUsers = () => {
    const start = visibleUsers.value.length;
    const end = start + rowsPerPage.value;

    if (start < filteredUsers.value.length) {
        const newUsers = filteredUsers.value.slice(start, end);
        visibleUsers.value = [...visibleUsers.value, ...newUsers];
    }
};

const updateVisibleUsers = () => {
    if (isInfiniteScroll.value) {
        visibleUsers.value = filteredUsers.value.slice(0, rowsPerPage.value);
    }
};


// Chuyển đổi giữa chế độ phân trang và infinite scroll
const toggleMode = () => {
    isInfiniteScroll.value = !isInfiniteScroll.value;

    if (isInfiniteScroll.value) {
        visibleUsers.value = filteredUsers.value.slice(0, rowsPerPage.value);
        nextTick(() => {
            setupObserver();
        });
    } else {
        if (observer) observer.disconnect();
        visibleUsers.value = [];
    }
};

onMounted(() => {
    fetchUsers();

    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    isDarkMode.value = savedDarkMode;
    document.body.classList.toggle('dark-mode', savedDarkMode);

    if (isInfiniteScroll.value) {
        nextTick(() => {
            setupObserver();
        });
    }
});

onUnmounted(() => {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
});

watch(filterQuery, () => {
    updateVisibleUsers();
});

watch(errorMessage, (newValue) => {
    if (newValue) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: newValue,
            confirmButtonText: 'OK',
        }).then(() => {
            errorMessage.value = null; // Reset errorMessage sau khi hiển thị
        });
    }
});
</script>

<style>
/* Table styles */
.table {
    width: 100%;
    height: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
    font-family: 'Roboto', sans-serif;
}

.table th,
.table td {
    padding: 1rem;
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
    padding: 0.25rem 0.5rem;
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
    color: #93ffe0;
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
    font-weight: bold;
    font-family: 'Roboto', sans-serif;
    margin-left: 1rem;
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


/* Sort icon styles */
.sort-icon {
    font-size: 16px;
    margin-left: 8px;
    cursor: pointer;
    color: #6c757d;
    transition: color 0.3s ease;
}

.sort-icon:hover {
    color: #93ffe0;
}


/* Wrapper for the search input and icons */
.filter-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.filter-input-wrapper {
    display: flex;
    align-items: center;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #f8f9fa;
    overflow: hidden;
    margin-left: 1rem;
    width: 300px;
}

.filter-input {
    flex: 1;
    border: none;
    padding: 0.5rem;
    font-size: 1rem;
    background-color: transparent;
    outline: none;
}

.clear-icon {
    font-size: 20px;
    color: #dc3545;
    cursor: pointer;
    margin-right: 8px;
}

/* Dark mode styles */
body.dark-mode {
    background-color: #121212;
    color: #ffffff;
}

body.dark-mode .table th,
body.dark-mode .table td {
    background-color: #1e1e1e;
    color: #ffffff;
}

body.dark-mode .filter-input-wrapper {
    background-color: #333333;
    border-color: #444444;
}

body.dark-mode .filter-input {
    color: #ffffff;
}

body.dark-mode .pagination-controls button {
    background-color: #333333;
    border-color: #444444;
    color: #ffffff;
}

body.dark-mode .pagination-controls button.active {
    background-color: #007bff;
    color: #ffffff;
}

.toggle-icon {
    font-size: 45px;
    cursor: pointer;
    color: #6c757d;
    transition: color 0.3s ease;
}

.toggle-icon:hover {
    color: #93ffe0;
}

body.dark-mode .toggle-icon {
    color: #ffffff;
}

body.dark-mode .toggle-icon:hover {
    color: #93ffe0;
}

.mode-toggle-button {
    font-size: 40px;
    cursor: pointer;
}

.mode-toggle-button:hover {
    background-color: #93ffe0;
    color: #ffffff;
}

.sentinel {
    height: 20px;
}

.icon-container {
    display: flex;
    width: 100px;
    margin-right: 1rem;
    justify-content: space-between;
}

/* Loading spinner styles */
.loading-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    /* Chiều cao toàn màn hình */
}

.loading-spinner .spinner {
    color: #6c757d;
    font-size: 6rem;
    /* Màu xám nhạt */
}
</style>