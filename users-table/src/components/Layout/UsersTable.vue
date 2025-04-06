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
import '../../assets/UsersTable.css'; // Corrected path to CSS styles
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
const editUser = async (userId: string) => {
    const user = users.value.find(user => user.id === userId);
    if (user) {
        Swal.fire({
            title: 'Edit User',
            html: `
                <div class="form-container">
                    <div class="form-group">
                        <label for="edit-name">Name:</label>
                        <input id="edit-name" class="form-input" type="text" value="${user.name}" />
                    </div>
                    <div class="form-group">
                        <label for="edit-balance">Balance:</label>
                        <input id="edit-balance" class="form-input" type="number" value="${user.balance}" />
                    </div>
                    <div class="form-group">
                        <label for="edit-email">Email:</label>
                        <input id="edit-email" class="form-input" type="email" value="${user.email}" />
                    </div>
                    <div class="form-group">
                        <label for="edit-active">Active:</label>
                        <select id="edit-active" class="form-input">
                            <option value="true" ${user.active ? 'selected' : ''}>Active</option>
                            <option value="false" ${!user.active ? 'selected' : ''}>Inactive</option>
                        </select>
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Save',
            cancelButtonText: 'Cancel',
            preConfirm: () => {
                const name = (document.getElementById('edit-name') as HTMLInputElement).value;
                const balance = parseFloat((document.getElementById('edit-balance') as HTMLInputElement).value);
                const email = (document.getElementById('edit-email') as HTMLInputElement).value;
                const active = (document.getElementById('edit-active') as HTMLSelectElement).value === 'true';

                if (!name || !email || isNaN(balance)) {
                    Swal.showValidationMessage('Please fill out all fields correctly.');
                    return null;
                }

                return { name, balance, email, active };
            },
        }).then(async result => {
            if (result.isConfirmed && result.value) {
                try {
                    // Gửi yêu cầu cập nhật đến API
                    const response = await fetch(`https://67f1121fc733555e24ac15eb.mockapi.io/api/users/users/${userId}`, {
                        method: 'PUT', // Hoặc 'PATCH' nếu chỉ cập nhật một phần
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(result.value),
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to update user: ${response.statusText}`);
                    }

                    const updatedUser = await response.json();

                    // Cập nhật dữ liệu cục bộ
                    user.name = updatedUser.name;
                    user.balance = updatedUser.balance;
                    user.email = updatedUser.email;
                    user.active = updatedUser.active;

                    Swal.fire({
                        title: 'Updated!',
                        text: `${user.name}'s information has been updated.`,
                        icon: 'success',
                        confirmButtonText: 'OK',
                    });
                } catch (error: any) {
                    Swal.fire({
                        title: 'Error!',
                        text: error.message || 'Failed to update user.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                    });
                }
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
