let id = null, condition = null, page = 1, query = '', limit = 5, sortBy = '_id', sortMode = 'desc';

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
        sortMode = sortMode === 'desc' ? 'asc' : 'desc';
    } else {
        sortBy = field;
        sortMode = 'desc';
    }

    document.querySelectorAll('th button').forEach((btn) => {
        const icon = btn.querySelector('i');
        if (btn.getAttribute('onclick').includes(field)) {
            if (sortMode === 'desc') {
                icon.className = 'fa-solid fa-sort-up'
            } else {
                icon.className = 'fa-solid fa-sort-down'
            }
        } else {
            icon.className = 'fa-solid fa-sort';
        }
    });

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
    page = 1
    sortBy = '_id'
    sortMode = 'desc'

    document.querySelectorAll('th button').forEach((btn) => {
        const icon = btn.querySelector('i')
        if(btn.getAttribute('onclick').includes('_id')) {
            icon.className = 'fa-solid fa-ort-up'
        } else {
            icon.className = 'fa-solid fa-sort'
        }
    })
    console.log("Query di reset", query)
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

    let paginationHTML = '';

    paginationHTML += `
        <li class="page-item ${page === 1 ? 'disabled' : ''}">
            <button class="page-link" onclick="changePage(${page - 1})">&laquo;</button>
        </li>
    `;

    for (let i = 1; i <= users.pages; i++) {
        paginationHTML += `
        <li class="page-item ${page === i ? 'active' : ''}">
            <button class="page-link" onclick="changePage(${i})">${i}</button>
        </li>
        `;
    }

    paginationHTML += `
        <li class="page-item ${page === users.pages ? 'disabled' : ''}">
            <button class="page-link" onclick="changePage(${page + 1})">&raquo;</button>
        </li>
    `;

    document.getElementById('button-pagination').innerHTML = paginationHTML;

    const showingStart = users.offset + 1;
    const showingEnd = Math.min(users.offset + users.data.length, users.total);
    document.querySelector('.pagination-info').textContent = `Showing ${showingStart} to ${showingEnd} of ${users.total} entries`;
};

const addData = async () => {
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!name || !phone) {
        alert('Harap isi data yang benar!');
        return; 
    }

    if (!/^\d+$/.test(phone)) {
        alert('Harap masukkan menggunakan angka pada field phone!');
        return; 
    }

    try {
        await fetch("http://localhost:3000/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, phone }),
        });

        readData();

        document.getElementById('name').value = '';
        document.getElementById('phone').value = '';
    } catch (error) {
        console.error('Error adding data:', error);
        alert('Terjadi kesalahan saat menambahkan data!');
    }
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

document.addEventListener("DOMContentLoaded", () => {
    const clearButton = document.querySelector(".btn-warning");
    clearButton.addEventListener("click", () => {
        console.log("Clear button clicked via addEventListener");
        clear();
    });
});