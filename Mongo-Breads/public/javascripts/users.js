// Variables
let id = null, condition = null, page = 1, query = '', limit = 5, sortBy = '_id', sortMode = 'asc';

// Support functions
function getId(_id) {
    id = _id;
}

let button = document.getElementById('mybutton');
button.onclick = () => {
    condition ? addData() : editData();
};

let addButton = document.getElementById('addButton');
addButton.onclick = () => {
    condition = true;
    document.getElementById('name').value = "";
    document.getElementById('phone').value = "";
};

const sortNameAsc = (name) => {
    sortBy = name;
    sortMode = 'asc';
    document.getElementById('sort-name').innerHTML = `
        <a type="button" onclick="sortNameDesc('name')"><i class="fa-solid fa-sort-up"></i></a>
        Name
    `;
    readData();
};

const sortNameDesc = (name) => {
    sortBy = name;
    sortMode = 'desc';
    document.getElementById('sort-name').innerHTML = `
        <a type="button" onclick="sortNameAsc('name')"><i class="fa-solid fa-sort-down"></i></a>
        Name
    `;
    readData();
};

const toggleSort = (field) => {
    if (sortBy === field) {
        // Toggle sorting mode
        sortMode = sortMode === 'asc' ? 'desc' : 'asc';
    } else {
        // Set new sorting field
        sortBy = field;
        sortMode = 'asc'; // Default to ascending
    }

    // Update icons and header texts
    document.querySelectorAll('th button').forEach((btn) => {
        const icon = btn.querySelector('i');
        if (btn.getAttribute('onclick').includes(field)) {
            // Update the clicked button
            if (sortMode === 'asc') {
                icon.className = 'fa-solid fa-sort-up'; // Icon for ascending
            } else {
                icon.className = 'fa-solid fa-sort-down'; // Icon for descending
            }
        } else {
            // Reset other buttons to default icon
            icon.className = 'fa-solid fa-sort';
        }
    });

    // Reload data with new sorting
    readData();
};


const browse = () => {
    query = document.getElementById('inputData').value.trim();
    page = 1;
    readData();
};

const clear = () => {
    query = '';
    document.getElementById('inputData').value = '';
    readData();
};

const chooselimit = () => {
    limit = document.getElementById('showData').value;
    page = 1;
    readData();
};

const changePage = async (num) => {
    page = num;
    readData();
};

// Main functions
const readData = async () => {
    const response = await fetch(`http://localhost:3000/api/users?query=${query}&page=${page}&limit=${limit}&sortBy=${sortBy}&sortMode=${sortMode}`);
    const users = await response.json();

    // Populate table
    let html = '';
    users.data.forEach((item, index) => {
        html += `
        <tr>
            <th scope="row">${index + users.offset + 1}</th>
            <td>${item.name}</td>
            <td>${item.phone}</td>
            <td>
                <button class="btn btn-success" onclick="getoneData('${item._id}')" data-bs-toggle="modal" data-bs-target="#addData"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger" onclick="getId('${item._id}')" data-bs-toggle="modal" data-bs-target="#deleteData"><i class="fa-solid fa-trash"></i></button>
                <a href="/users/${item._id}/todos" class="btn btn-warning"><i class="fa-solid fa-right-to-bracket"></i></a>
            </td>
        </tr>
        `;
    });
    document.getElementById('users-table-tbody').innerHTML = html;

    // Pagination
    let paginationHTML = '';

    // Tombol previous
    paginationHTML += `
        <li class="page-item ${page === 1 ? 'disabled' : ''}">
            <button class="page-link" onclick="changePage(${page - 1})">&laquo;</button>
        </li>
    `;

    // Tombol halaman
    for (let i = 1; i <= users.pages; i++) {
        paginationHTML += `
        <li class="page-item ${page === i ? 'active' : ''}">
            <button class="page-link" onclick="changePage(${i})">${i}</button>
        </li>
        `;
    }

    // Tombol next
    paginationHTML += `
        <li class="page-item ${page === users.pages ? 'disabled' : ''}">
            <button class="page-link" onclick="changePage(${page + 1})">&raquo;</button>
        </li>
    `;

    document.getElementById('button-pagination').innerHTML = paginationHTML;

    // Showing data information
    const showingStart = users.offset + 1;
    const showingEnd = Math.min(users.offset + users.data.length, users.total);
    document.querySelector('.pagination-info').textContent = `Showing ${showingStart} to ${showingEnd} of ${users.total} entries`;
};

const addData = async () => {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, phone }),
    });
    readData();
};

const getoneData = async (_id) => {
    condition = false;
    const response = await fetch(`http://localhost:3000/api/users/${_id}`);
    const user = await response.json();
    getId(user._id);
    document.getElementById('name').value = user.name;
    document.getElementById('phone').value = user.phone;
};

const editData = async () => {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    await fetch(`http://localhost:3000/api/users/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, phone }),
    });
    readData();
};

const deleteData = async () => {
    await fetch(`http://localhost:3000/api/users/${id}`, { method: "DELETE" });
    readData();
};

readData();

const pageTodos = async (id) => {
    const response = await fetch(`http://localhost:3000/users/${id}/todos`)
    const todos = await response.json()
}