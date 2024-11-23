// Variables
let id = null, title = '', complete = '', page = 1, limit = 10, sortBy = '_id', sortMode = 'desc';
let deadline = '', startdateDeadline = '', enddateDeadline = '';
let coba = false

// Support functions

function getId(_id) {
    id = _id
}

const browseData = () => {
    page = 1
    console.log('hehehe')
    title = $('#searchTitle').val()
    startdateDeadline = $('#startdateDeadline').val()
    enddateDeadline = $('#enddateDeadline').val()
    if ($('#completeTodo').val()) complete = $('#completeTodo').val()
    else complete = ''
    readData(!coba)
}

const resetData = () => {
    title = ''
    startdateDeadline = ''
    enddateDeadline = ''
    complete = ''
    $('#searchTitle').val('')
    $('#startdateDeadline').val('')
    $('#enddateDeadline').val('')
    $('#completeTodo').val('')

    sortBy = "_id"
    sortMode = 'desc'
    let defaultMode = `
    <button class="btn btn-success" onclick="sortDesc('deadline')"><i class="fa-solid fa-sort"></i> sort by deadline</button>
    `
    $('#changeSort').html(defaultMode)
    readData(!coba)
}

let isAscending = true; // Status awal sorting

const toggleSort = (field) => {
    // Tetapkan default sorting saat tombol pertama kali diklik
    if (sortBy !== field) {
        sortBy = field;
        sortMode = 'asc'; // Reset ke ascending
        isAscending = true;
    } else {
        // Jika field yang sama, toggle antara ascending dan descending
        sortMode = isAscending ? 'desc' : 'asc';
        isAscending = !isAscending;
    }

    page = 1; // Reset ke halaman pertama saat sorting berubah

    // Update tombol sorting di DOM
    const buttonHTML = `
        <button class="btn btn-success" onclick="toggleSort('${field}')">
            <i class="fa-solid ${isAscending ? 'fa-sort-up' : 'fa-sort-down'}"></i> Sort by ${field}
        </button>
    `;
    $('#changeSort').html(buttonHTML);

    // Panggil fungsi untuk memuat ulang data
    readData(true); // Passing `true` untuk mengganti data lama
};


$(window).scroll(function () {
    if ($(document).scrollTop() >= $(document).height() - $(window).height()) {
        page++
        console.log(page)
        readData(coba)
    }
})


// Main functions
const readData = async (replaceData) => {
    try {
        const todos = await $.ajax({
            url: `/api/todos`,
            method: "GET",
            dataType: "json",
            data: {
                executor,
                sortBy,
                sortMode,
                deadline,
                title,
                startdateDeadline,
                enddateDeadline,
                complete,
                page,
                limit
            }
        });

        // Log data untuk debugging
        console.log('Sorted Data:', todos.data);

        // Render data
        let list = '';
        todos.data.forEach((item, index) => {
            list += `
    <div id="${item._id}" class="foot2 ${item.complete === false && new Date(`${item.deadline}`).getTime() < new Date().getTime() ? 'alert alert-danger' : item.complete === true ? 'alert alert-success' : 'alert alert-secondary'}" role="alert">
        <div class="d-flex justify-content-between align-items-center">
            <span>${moment(item.deadline).format('DD-MM-YYYY HH:mm')} ${item.title}</span>
            <div class="d-flex gap-2">
                <a type="button" class="btn btn-sm btn-outline-primary" onclick="getData('${item._id}')" data-bs-toggle="modal" data-bs-target="#edit">
                    <i class="fa-solid fa-pencil"></i>
                </a>
                <a type="button" class="btn btn-sm btn-outline-danger" onclick="getId('${item._id}')" data-bs-toggle="modal" data-bs-target="#delete">
                    <i class="fa-solid fa-trash"></i>
                </a>
            </div>
        </div>
    </div>
    `;
        });


        // Ganti atau tambahkan data berdasarkan parameter replaceData
        if (replaceData) {
            $('#showTodos').html(list);
        } else {
            $('#showTodos').append(list);
        }
    } catch (e) {
        console.error('Error fetching data:', e);
        alert('Pengambilan data gagal');
    }
};

readData(coba)

const addData = async () => {
    try {
        title = $('#title').val()
        const a_day = 24 * 60 * 60 * 1000
        const todos = await $.ajax({
            url: `/api/todos`,
            method: "POST",
            dataType: "json",
            data: {
                title,
                executor
            }
        });
        let newlist = ''
        newlist += `
        <div id="${todos[0]._id}" class="foot2 ${todos[0].complete == false && new Date(`${todos[0].deadline}`).getTime() < new Date().getTime() ? ' alert alert-danger' : todos[0].complete == true ? ' alert alert-success' : ' alert alert-secondary'}" role="alert">
            ${moment(new Date(Date.now() + a_day)).format('DD-MM-YYYY HH:mm')} ${title}
            <div>
            <a type="button" onclick="getData('${todos[0]._id}')" data-bs-toggle="modal" data-bs-target="#edit"><i class="fa-solid fa-pencil"></i></a>
            <a type="button" onclick="getId('${todos[0]._id}')" data-bs-toggle="modal" data-bs-target="#delete"><i class="fa-solid fa-trash mx-2"></i></a>
            </div>
        </div>
        `
        $('#showTodos').prepend(newlist)
        title = ''
        $('#title').val('')
    } catch (e) {
        alert('Data gagal ditambahkan')
    }
}

const getData = async (_id) => {
    try {
        getId(_id)
        const todo = await $.ajax({
            url: `/api/todos/${_id}`,
            method: "GET",
            dataType: "json",
        });
        $('#editTitle').val(todo.title)
        $('#editDeadline').val(moment(todo.deadline).format('YYYY-MM-DDThh:mm'))
        $('#editComplete').prop('checked', todo.complete)
    } catch (e) {
        console.log(e)
        alert('tidak dapat menampilkan data')
    }
}

const editData = async () => {
    try {
        title = $('#editTitle').val()
        deadline = $('#editDeadline').val()
        complete = $('#editComplete').prop('checked')
        const a_day = 24 * 60 * 60 * 1000
        const todo = await $.ajax({
            url: `/api/todos/${id}`,
            method: "PUT",
            dataType: "json",
            data: {
                title,
                executor,
                deadline,
                complete: Boolean(complete)
            }
        });
        let newData = ''
        newData += `
        ${moment(new Date(deadline)).format('DD-MM-YYYY HH:mm')} ${title}
        <div>
        <a type="button" onclick="getData('${todo._id}')" data-bs-toggle="modal" data-bs-target="#edit"><i class="fa-solid fa-pencil"></i></a>
        <a type="button" onclick="getId('${todo._id}')" data-bs-toggle="modal" data-bs-target="#delete"><i class="fa-solid fa-trash mx-2"></i></a>
        </div>
        `
        $(`#${todo._id}`).attr('class', `foot2 ${todo.complete == false && new Date(`${todo.deadline}`).getTime() < new Date().getTime() ? ' alert alert-danger' : todo.complete == true ? ' alert alert-success' : ' alert alert-secondary'}`).html(newData)
        title = $('#searchTitle').val()
        if ($('#completeTodo').val()) complete = $('#completeTodo').val()
        else complete = ''

    } catch (e) {
        console.log(e)
        alert('Perubahan data gagal')
    }
}

const deleteData = async () => {
    try {
        const todo = await $.ajax({
            url: `/api/todos/${id}`,
            method: "DELETE",
            dataType: "json",
        })
        $(`#${id}`).remove()

    } catch (error) {

    }
}