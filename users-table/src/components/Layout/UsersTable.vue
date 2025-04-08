<template>
    <div v-if="isLoading" class="loading-spinner">
        <!-- Display a loading spinner while data is being fetched -->
        <Icon icon="eos-icons:bubble-loading" class="spinner" />
    </div>
    <div v-if="!isLoading && !errorMessage">
        <!-- Main content displayed when data is loaded and no errors exist -->

        <div class="filter-container">
            <!-- Container for search input and mode toggle icons -->
            <div class="filter-input-wrapper">
                <!-- Search input for filtering users by name or email -->
                <input type="text" v-model="filterQuery" placeholder="Search by name or email..."
                    class="filter-input" />
                <!-- Clear button to reset the search query -->
                <Icon icon="material-symbols:close" class="clear-icon" v-if="filterQuery" @click="clearSearch" />
            </div>

            <div class="icon-container">
                <!-- Toggle between infinite scroll and pagination -->
                <div :title="(isInfiniteScroll ? 'Pagination' : 'Infinite Scroll')">
                    <Icon icon="ph:mouse-scroll" class="mode-toggle-button" @click="toggleMode" />
                </div>

                <!-- Toggle between dark and light mode -->
                <div :title="` ${isDarkMode ? 'Light' : 'Dark'} mode`">
                    <Icon :icon="isDarkMode ? 'material-symbols:light-mode' : 'material-symbols:dark-mode'"
                        class="toggle-icon" @click="toggleDarkMode" />
                </div>
            </div>
        </div>

        <!-- Table displaying user data -->
        <table class="table">
            <thead>
                <tr>
                    <!-- Checkbox column for selecting all users -->
                    <th class="col-checkbox">
                        <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
                    </th>
                    <!-- Name column with sorting capability -->
                    <th class="col-name">
                        Name
                        <Icon :icon="getSortIcon('name')" class="sort-icon" @click="sortTable('name')" />
                    </th>
                    <!-- Balance column with sorting capability -->
                    <th class="col-balance">
                        Balance
                        <Icon :icon="getSortIcon('balance')" class="sort-icon" @click="sortTable('balance')" />
                    </th>
                    <!-- Email column with sorting capability -->
                    <th class="col-email">
                        Email
                        <Icon :icon="getSortIcon('email')" class="sort-icon" @click="sortTable('email')" />
                    </th>
                    <!-- Registration date column with sorting capability -->
                    <th class="col-registration">
                        Registration
                        <Icon :icon="getSortIcon('registerAt')" class="sort-icon" @click="sortTable('registerAt')" />
                    </th>
                    <!-- Status column with sorting capability -->
                    <th class="col-status">
                        Status
                        <Icon :icon="getSortIcon('active')" class="sort-icon" @click="sortTable('active')" />
                    </th>
                    <!-- Action column for edit/delete operations -->
                    <th class="col-action">Action</th>
                </tr>
            </thead>
            <tbody>
                <!-- Dynamically render table rows based on display mode (infinite scroll or pagination) -->
                <tr v-for="user in (isInfiniteScroll ? visibleUsers : paginatedUsers)" :key="user.id">
                    <td class="col-checkbox">
                        <!-- Checkbox for selecting individual users -->
                        <input type="checkbox" v-model="selectedUsers" :value="user.id" />
                    </td>
                    <td class="col-name">{{ user.name }}</td>
                    <td class="col-balance">{{ formatBalance(user.balance) }}</td>
                    <td class="col-email">
                        <!-- Email link for direct emailing -->
                        <a :href="`mailto:${user.email}`">{{ user.email }}</a>
                    </td>
                    <td class="col-registration">
                        <!-- Formatted registration date with tooltip showing full date -->
                        <span :title="user.registerAt.toLocaleString()">
                            {{ formatDate(user.registerAt) }}
                        </span>
                    </td>
                    <td class="col-status">
                        <!-- Button indicating user status (active/inactive) -->
                        <button :class="['status-button', user.active ? 'active' : 'inactive']">
                            Status
                        </button>
                    </td>
                    <td class="col-action">
                        <!-- Edit and delete action icons -->
                        <Icon icon="material-symbols:edit-outline" class="action-icon edit-icon"
                            @click="editUser(user.id)" />
                        <Icon icon="material-symbols:delete-outline" class="action-icon delete-icon"
                            @click="deleteUser(user.id)" />
                    </td>
                </tr>
            </tbody>
            <!-- Sentinel element for triggering infinite scroll -->
            <div v-if="isInfiniteScroll" ref="sentinel" class="sentinel"></div>
        </table>

        <!-- Pagination controls displayed only in pagination mode -->
        <div class="pagination" v-if="!isInfiniteScroll && !filterQuery">
            <div class="results-count">{{ users.length }} results</div>
            <div class="pagination-controls">
                <!-- Previous page button -->
                <button @click="currentPage--" :disabled="currentPage === 1">
                </button>
                <!-- Dynamic page numbers with ellipsis for large datasets -->
                <span v-for="page in visiblePages" :key="page">
                    <button v-if="page !== '...'" :class="{ active: page === currentPage }"
                        @click="currentPage = Number(page)">
                        {{ page }}
                    </button>
                    <span v-else>...</span>
                </span>
                <!-- Next page button -->
                <button @click="currentPage++" :disabled="currentPage === totalPages">></button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import '../../assets/UsersTable.css'; // Import CSS styles for the table
import Swal from 'sweetalert2'; // Import SweetAlert2 for modals and alerts
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'; // Vue composition API utilities
import { Icon } from '@iconify/vue'; // Iconify component for icons

// Define the user interface
interface TUser {
    id: string;
    name: string;
    balance: number;
    email: string;
    registerAt: Date;
    active: boolean;
}

// Reactive state for users data
const users = ref<TUser[]>([]); // List of users
const isLoading = ref(false); // Loading state for data fetching
const errorMessage = ref<string | null>(null); // Error message if data fetch fails

// Function to fetch user data from a mock API
const fetchUsers = async () => {
    isLoading.value = true; // Show loading spinner
    errorMessage.value = null; // Reset any previous errors

    try {
        const response = await fetch('https://67f1121fc733555e24ac15eb.mockapi.io/api/users/users');
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        // Map API data to TUser interface
        users.value = data.map((user: any) => ({
            id: user.id,
            name: user.name,
            balance: parseFloat(user.balance),
            email: user.email,
            registerAt: new Date(user.registerAt * 1000), // Convert timestamp to Date
            active: user.active,
        }));
    } catch (error: any) {
        errorMessage.value = error.message || 'Failed to fetch data.';
    } finally {
        isLoading.value = false; // Hide loading spinner
    }
};

// Pagination-related state
const rowsPerPage = ref(10); // Number of rows per page
const currentPage = ref(1); // Current page number

// Computed property for total number of pages
const totalPages = computed(() => Math.ceil(users.value.length / rowsPerPage.value));

// Search filter state
const filterQuery = ref<string>(''); // Search query input

// Computed property for filtered and sorted users
const filteredUsers = computed(() => {
    let result = users.value;

    // Apply search filter
    if (filterQuery.value) {
        const query = filterQuery.value.toLowerCase();
        result = result.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );
    }

    // Apply sorting based on sortKey and sortOrder
    if (sortKey.value) {
        result = [...result].sort((a, b) => {
            const aValue = a[sortKey.value as keyof TUser];
            const bValue = b[sortKey.value as keyof TUser];

            // Handle string sorting naturally
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortOrder.value === 'asc'
                    ? aValue.localeCompare(bValue, undefined, { numeric: true })
                    : bValue.localeCompare(aValue, undefined, { numeric: true });
            }

            // Handle numeric or other type sorting
            if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1;
            return 0;
        });
    }

    updateVisibleUsers(); // Update visible users for infinite scroll
    return result;
});

// Computed property for paginated users
const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * rowsPerPage.value;
    return filteredUsers.value.slice(start, start + rowsPerPage.value);
});

// State for selected users
const selectedUsers = ref<string[]>([]); // Array of selected user IDs

// Toggle select all checkboxes
const toggleSelectAll = (event: Event) => {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isInfiniteScroll.value) {
        // Select all visible users in infinite scroll mode
        if (isChecked) {
            selectedUsers.value = visibleUsers.value.map(user => user.id);
        } else {
            selectedUsers.value = [];
        }
    } else {
        // Select all paginated users in pagination mode
        if (isChecked) {
            selectedUsers.value = paginatedUsers.value.map(user => user.id);
        } else {
            selectedUsers.value = [];
        }
    }
};

// Computed property to check if all visible users are selected
const isAllSelected = computed(() => {
    if (isInfiniteScroll.value) {
        return visibleUsers.value.every(user => selectedUsers.value.includes(user.id));
    } else {
        return paginatedUsers.value.every(user => selectedUsers.value.includes(user.id));
    }
});

// Sorting state
const sortKey = ref<string | null>(null); // Current sort column
const sortOrder = ref<'asc' | 'desc'>('asc'); // Sort direction

// Function to get the appropriate sort icon based on sort state
const getSortIcon = (key: string) => {
    if (sortKey.value === key) {
        return sortOrder.value === 'asc'
            ? 'material-symbols:arrow-upward'
            : 'material-symbols:arrow-downward';
    }
    return 'flowbite:sort-outline';
};

// Function to handle table sorting
const sortTable = (key: string) => {
    if (sortKey.value === key) {
        // Toggle sort order if same key
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
        // Set new sort key and default to ascending
        sortKey.value = key;
        sortOrder.value = 'asc';
    }
    updateVisibleUsers(); // Update visible users after sorting
};

// Computed property for visible pagination pages
const visiblePages = computed(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 6;
    const totalPagesCount = totalPages.value;

    if (totalPagesCount <= maxVisible) {
        // Show all pages if total pages are less than maxVisible
        for (let i = 1; i <= totalPagesCount; i++) {
            pages.push(i);
        }
    } else {
        // Handle pagination with ellipsis for large datasets
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

// Function to edit a user with a modal form
const editUser = async (userId: string) => {
    const user = users.value.find(user => user.id === userId);
    if (user) {
        Swal.fire({
            title: 'Edit User',
            // HTML form for editing user details
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
            // Validate and collect form data before confirming
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
                    // Send update request to API
                    const response = await fetch(`https://67f1121fc733555e24ac15eb.mockapi.io/api/users/users/${userId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(result.value),
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to update user: ${response.statusText}`);
                    }

                    const updatedUser = await response.json();

                    // Update local user data
                    user.name = updatedUser.name;
                    user.balance = updatedUser.balance;
                    user.email = updatedUser.email;
                    user.active = updatedUser.active;

                    // Show success message
                    Swal.fire({
                        title: 'Updated!',
                        text: `${user.name}'s information has been updated.`,
                        icon: 'success',
                        confirmButtonText: 'OK',
                    });
                } catch (error: any) {
                    // Show error message if update fails
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

// Function to delete a user with confirmation
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
                // Remove user from local data
                users.value = users.value.filter(user => user.id !== userId);

                // Show success message
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

// Formatters for balance and date
const formatBalance = (balance: number) => `$${balance.toLocaleString()}`; // Format balance with currency
const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Pad month with leading zero
    const day = String(date.getDate()).padStart(2, '0'); // Pad day with leading zero
    return `${year}-${month}-${day}`; // Return formatted date
};

// Function to clear the search query
const clearSearch = () => {
    filterQuery.value = '';
};

// Dark mode state and toggle
const isDarkMode = ref(false); // Dark mode state

const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
    document.body.classList.toggle('dark-mode', isDarkMode.value); // Toggle dark mode class on body
    localStorage.setItem('darkMode', isDarkMode.value.toString()); // Save preference to localStorage
};

// Infinite scroll state
const isInfiniteScroll = ref(false); // Toggle between infinite scroll and pagination

// Infinite scroll observer setup
let observer: IntersectionObserver | null = null; // Observer for infinite scroll
const visibleUsers = ref<TUser[]>([]); // Users visible in infinite scroll mode

const setupObserver = () => {
    const sentinel = document.querySelector('.sentinel');
    if (!sentinel) return;

    // Set up IntersectionObserver to load more users when sentinel is visible
    observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting) {
                loadMoreUsers();
            }
        },
        {
            root: null, // Use viewport as root
            rootMargin: '0px', // Trigger when sentinel enters viewport
            threshold: 1.0, // Trigger when sentinel is fully visible
        }
    );

    observer.observe(sentinel);
};

// Function to load more users in infinite scroll mode
const loadMoreUsers = () => {
    const start = visibleUsers.value.length;
    const end = start + rowsPerPage.value;

    if (start < filteredUsers.value.length) {
        const newUsers = filteredUsers.value.slice(start, end);
        visibleUsers.value = [...visibleUsers.value, ...newUsers]; // Append new users
    }
};

// Function to update visible users based on filters or mode
const updateVisibleUsers = () => {
    if (isInfiniteScroll.value) {
        visibleUsers.value = filteredUsers.value.slice(0, rowsPerPage.value); // Reset visible users
    }
};

// Function to toggle between pagination and infinite scroll
const toggleMode = () => {
    isInfiniteScroll.value = !isInfiniteScroll.value;

    if (isInfiniteScroll.value) {
        visibleUsers.value = filteredUsers.value.slice(0, rowsPerPage.value); // Initial load for infinite scroll
        nextTick(() => {
            setupObserver(); // Set up observer after DOM update
        });
    } else {
        if (observer) observer.disconnect(); // Disconnect observer in pagination mode
        visibleUsers.value = []; // Clear visible users
    }
};

// Lifecycle hooks
onMounted(() => {
    fetchUsers(); // Fetch users when component mounts

    // Load dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    isDarkMode.value = savedDarkMode;
    document.body.classList.toggle('dark-mode', savedDarkMode);

    // Set up infinite scroll observer if enabled
    if (isInfiniteScroll.value) {
        nextTick(() => {
            setupObserver();
        });
    }
});

onUnmounted(() => {
    if (observer) {
        observer.disconnect(); // Clean up observer on component unmount
        observer = null;
    }
});

// Watch filterQuery to update visible users when search changes
watch(filterQuery, () => {
    updateVisibleUsers();
});

// Watch errorMessage to display errors with SweetAlert
watch(errorMessage, (newValue) => {
    if (newValue) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: newValue,
            confirmButtonText: 'OK',
        }).then(() => {
            errorMessage.value = null; // Reset error message after display
        });
    }
});
</script>