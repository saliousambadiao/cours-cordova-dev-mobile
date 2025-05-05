window.onload = function() {
    const addButton = document.getElementById('addButton');
    const resetButton = document.getElementById('resetButton');
    const taskField = document.getElementById('taskField');  
    const taskList = document.getElementById('taskList'); 

    addButton.onclick = function () {
        if (taskField.value) {
            const newItem = document.createElement('li');
            newItem.innerText = taskField.value;

            $(newItem).on('swiperight', function () {
                $(newItem).toggleClass('done');
            })

            $(newItem).on('swipeleft', function () {
                $(newItem).hide('slow', function () {
                    $(newItem).remove();
                });
            })

            taskList.append(newItem);
            $(taskList).listview('refresh');
            taskField.select();
        }
        
    }

    resetButton.onclick = function () {
        taskList.innerHTML = '';
        taskField.value = '';
        taskField.focus();
    }
}
