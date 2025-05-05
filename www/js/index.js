window.onload = function() {
    const addButton = document.getElementById('addButton');
    const resetButton = document.getElementById('resetButton');
    const taskField = document.getElementById('taskField'); 
    const activeTaskList = document.getElementById('activeTaskList'); 
    const finishedTaskList = document.getElementById('finishedTaskList'); 
    const taskForm = document.getElementById('taskForm');
    const pageContainer = document.querySelector('[data-role="page"]');

    // Fonction pour configurer les événements de swipe sur un élément de liste
    function setupSwipeEvents(item) {
        $(item).on('swiperight', function () {
            $(item).hide('slow', function () {
                $(item).show();
                // Si l'élément est dans la liste active, le déplacer vers la liste terminée
                if (item.parentElement === activeTaskList) {
                    finishedTaskList.append(item);
                    $(finishedTaskList).listview('refresh');
                } 
                // Sinon, le déplacer vers la liste active
                else if (item.parentElement === finishedTaskList) {
                    activeTaskList.append(item);
                    $(activeTaskList).listview('refresh');
                }
            });
        });

        $(item).on('swipeleft', function () {
            $(item).hide('slow', function () {
                $(item).remove();
            });
        });
    }

    // Appliquer les événements de swipe aux éléments déjà présents dans les listes
    function setupExistingItems() {
        $('#activeTaskList li').each(function() {
            setupSwipeEvents(this);
        });
        
        $('#finishedTaskList li').each(function() {
            setupSwipeEvents(this);
        });
    }

    // Gestion du clavier mobile
    function handleMobileKeyboard() {
        // Détection d'apparition et disparition du clavier
        const originalHeight = window.innerHeight;
        
        // Lorsque le champ de saisie reçoit le focus (clavier apparaît)
        taskField.addEventListener('focus', function() {
            // Ajouter une petite pause pour laisser le temps au clavier d'apparaître
            setTimeout(function() {
                // Si la hauteur de fenêtre a diminué significativement, c'est que le clavier est visible
                if (window.innerHeight < originalHeight * 0.8) {
                    // Ajouter une classe pour indiquer que le clavier est visible
                    pageContainer.classList.add('keyboard-visible');
                    
                    // Faire défiler la page pour voir le champ de saisie
                    taskField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);
        });
        
        // Lorsque le champ de saisie perd le focus (clavier disparaît)
        taskField.addEventListener('blur', function() {
            // Retirer la classe après une courte pause
            setTimeout(function() {
                pageContainer.classList.remove('keyboard-visible');
                // Remettre le footer en position fixe
                $.mobile.resetActivePageHeight();
            }, 300);
        });

        // Gestion du formulaire pour éviter que la page ne soit rechargée
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addTask();
            return false;
        });
    }

    // Fonction d'ajout de tâche extraite pour être réutilisable
    function addTask() {
        if (taskField.value) {
            const newItem = document.createElement('li');
            newItem.innerText = taskField.value;

            // Configurer les événements de swipe pour le nouvel élément
            setupSwipeEvents(newItem);

            // Ajouter le nouvel élément à la liste active
            activeTaskList.append(newItem);
            $(activeTaskList).listview('refresh');
            taskField.value = '';
            
            // Sur mobile, masquer le clavier après ajout
            taskField.blur();
        }
    }

    // Exécuter au chargement pour configurer les éléments existants
    setupExistingItems();
    handleMobileKeyboard();

    // Associer les gestionnaires d'événements
    addButton.onclick = addTask;

    resetButton.onclick = function () {
        activeTaskList.innerHTML = '';
        finishedTaskList.innerHTML = '';
        taskField.value = '';
        taskField.focus();
    }
}
