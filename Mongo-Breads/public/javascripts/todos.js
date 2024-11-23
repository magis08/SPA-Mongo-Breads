let id = null, title = '', complete = '', page = 1, limit = 50, sortBy = '_id', sortMode = 'desc';
let deadline = '', startdateDeadline = '', enddateDeadline = '';
let coba = false

function getId(_id) {
    id = _id
}

const browseData = () => {
    page = 1
    title = $('#searchTitle').val()
    startdateDeadline = $('#startdateDeadline').val()
    enddateDeadline = $('#enddateDeadline').val()
    if ($('#completeTodo').val()) complete = $('#completeTodo').val()
    else complete = ''
    readData(!coba)
}

const resetData = () => {
    title = '';
    startdateDeadline = '';
    enddateDeadline = '';
    complete = '';
    sortBy = '_id'; 
    sortMode = 'desc'; 
    page = 1;

    $('#searchTitle').val('');
    $('#startdateDeadline').val('');
    $('#enddateDeadline').val('');
    $('#completeTodo').val('');

    const defaultSortButton = `
        <button class="btn btn-success" onclick="toggleSort('deadline')">
            <i class="fa-solid fa-sort"></i> Sort by deadline
        </button>
    `;
    $('#changeSort').html(defaultSortButton);

    readData(true);
};


let isAscending = true;

const toggleSort = (field) => {
    if (sortBy !== field) {
        sortBy = field;
        sortMode = 'asc';
        isAscending = true;
    } else {
        sortMode = isAscending ? 'desc' : 'asc';
        isAscending = !isAscending;
    }

    page = 1;

    const buttonHTML = `
        <button class="btn btn-success" onclick="toggleSort('${field}')">
            <i class="fa-solid ${isAscending ? 'fa-sort-up' : 'fa-sort-down'}"></i> Sort by ${field}
        </button>
    `;
    $('#changeSort').html(buttonHTML);

    readData(true);
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

        // Render data
        let list = '';
        todos.data.forEach((item) => {
            const formattedDeadline = moment(new Date(item.deadline)).format('DD-MM-YYYY HH:mm');
            const itemClass = item.complete === false && new Date(`${item.deadline}`).getTime() < new Date().getTime()
                ? 'alert alert-danger'
                : item.complete === true
                    ? 'alert alert-success'
                    : 'alert alert-secondary';

            list += `
                <div id="${item._id}" class="foot2 ${itemClass}" role="alert">
                    <div class="d-flex justify-content-between align-items-center">
                        <span>${formattedDeadline} ${item.title}</span>
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

        if (replaceData) {
            $('#showTodos').html(list);
        } else {
            $('#showTodos').append(list);
        }

        if (todos.data.length === 0 && page > 1) {
            console.log('No more data to load');
        }
    } catch (e) {
        console.error('Error fetching data:', e);
        alert('Pengambilan data gagal');
    }
};
readData(coba)

const addData = async () => {
    try {
        const title = $('#title').val().trim();

        if (!title) {
            alert('Harap masukkan title!');
            return;
        }

        const a_day = 24 * 60 * 60 * 1000;
        const todos = await $.ajax({
            url: `/api/todos`,
            method: "POST",
            dataType: "json",
            data: {
                title,
                executor,
            }
        });

        const todo = todos[0];

        const itemClass = todo.complete === false && new Date(todo.deadline).getTime() < new Date().getTime()
            ? 'alert alert-danger'
            : todo.complete === true
                ? 'alert alert-success'
                : 'alert alert-secondary';

        const formattedDeadline = moment(new Date(Date.now() + a_day)).format('DD-MM-YYYY HH:mm');

        const newElement = `
            <div id="${todo._id}" class="foot2 ${itemClass}" role="alert">
                <div class="d-flex justify-content-between align-items-center">
                    <span>${formattedDeadline} ${todo.title}</span>
                    <div class="d-flex gap-2">
                        <a type="button" class="btn btn-sm btn-outline-primary" onclick="getData('${todo._id}')" data-bs-toggle="modal" data-bs-target="#edit">
                            <i class="fa-solid fa-pencil"></i>
                        </a>
                        <a type="button" class="btn btn-sm btn-outline-danger" onclick="getId('${todo._id}')" data-bs-toggle="modal" data-bs-target="#delete">
                            <i class="fa-solid fa-trash"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;

        $('#showTodos').prepend(newElement);

        $('#title').val('');
    } catch (e) {
        console.error('Error adding data:', e);
        alert('Data gagal ditambahkan');
    }
};

const getData = async (_id) => {
    try {
        getId(_id)
        const todo = await $.ajax({
            url: `/api/todos/${_id}`,
            method: "GET",
            dataType: "json",
        });
        $('#editTitle').val(todo.title)
        $('#editDeadline').val(moment(todo.deadline).format('YYYY-MM-DDTHH:mm'))
        $('#editComplete').prop('checked', todo.complete)
    } catch (e) {
        console.log(e)
        alert('data gagal ditampilkan')
    }
}

const editData = async () => {
    try {
        const title = $('#editTitle').val().trim();
        const deadline = $('#editDeadline').val();
        const complete = $('#editComplete').prop('checked');

        if (!title || !deadline) {
            alert('Harap isi semua data dengan benar!');
            return;
        }

        const todo = await $.ajax({
            url: `/api/todos/${id}`,
            method: "PUT",
            dataType: "json",
            data: {
                title,
                executor,
                deadline,
                complete: Boolean(complete),
            },
        });

        const updatedHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <span>${moment(deadline).format('DD-MM-YYYY HH:mm')} ${title}</span>
                <div class="d-flex gap-2">
                    <a type="button" class="btn btn-sm btn-outline-primary" onclick="getData('${todo._id}')" data-bs-toggle="modal" data-bs-target="#edit">
                        <i class="fa-solid fa-pencil"></i>
                    </a>
                    <a type="button" class="btn btn-sm btn-outline-danger" onclick="getId('${todo._id}')" data-bs-toggle="modal" data-bs-target="#delete">
                        <i class="fa-solid fa-trash"></i>
                    </a>
                </div>
            </div>
        `;

        $(`#${todo._id}`)
            .attr(
                'class',
                `foot2 ${complete
                    ? 'alert alert-success'
                    : new Date(deadline).getTime() < new Date().getTime()
                        ? 'alert alert-danger'
                        : 'alert alert-secondary'
                }`
            )
            .html(updatedHTML);

        $('#editModal').modal('hide'); 

    } catch (e) {
        console.error('Error updating data:', e);
        alert('Data gagal diubah!');
    }
};

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