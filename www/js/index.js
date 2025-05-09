// Stockage global des contacts pour pouvoir les réutiliser
let contactsData = [];
let currentContactId = null; // Pour stocker l'ID du contact actuellement affiché

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    displayContacts();
    
    // Ajouter un écouteur d'événements pour les clics sur la liste de contacts
    $(document).on('click', '#contactList li a', function(e) {
        const contactId = $(this).data('contact-id');
        displayContactDetails(contactId);
    });
    
    // Gérer la soumission du formulaire d'ajout de contact
    $('#addContactForm').on('submit', function(e) {
        e.preventDefault();
        createNewContact();
        return false;
    });
    
    // Gérer la soumission du formulaire d'édition de contact
    $('#editContactForm').on('submit', function(e) {
        e.preventDefault();
        updateContact();
        return false;
    });
    
    // Gérer le clic sur le bouton de suppression
    $(document).on('click', '#deleteContactBtn', function(e) {
        e.preventDefault();
        alert('Début du processus de suppression');
        if (confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
            alert('Confirmation accordée');
            deleteContact();
        }
        return false;
    });
    
    // Gérer le clic sur le bouton d'édition
    $(document).on('click', '#editContactBtn', function(e) {
        console.log('********** EDITION DE CONTACT INITIALISEE **********');
        prepareEditForm();
    });
    
    // Initialiser les éléments jQuery Mobile après avoir chargé la page de détails
    $(document).on('pagecontainerbeforeshow', function(event, ui) {
        if (ui.toPage.attr('id') === 'contactDetailsPage') {
            // Réinitialiser le style de la page de détails
            $(ui.toPage).find('ul').listview('refresh');
        }
    });
}

function displayContacts() {
    let options = new ContactFindOptions();
    options.multiple = true;
    options.hasPhoneNumber = true;

    let fields = ['*'];

    navigator.contacts.find(fields, showContacts, onError);
}

function showContacts(contacts) {
    // Stocker les contacts pour un accès global
    contactsData = contacts;
    
    // // Afficher la structure complète du premier contact pour déboguer
    if (contacts.length > 0) {
        console.log('Structure du premier contact:', JSON.stringify(contacts[0]));
    }
    
    let items = '';
    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        
        // Utiliser une logique pour déterminer le meilleur nom à afficher
        let displayName = contact.displayName;
        if (!displayName) {
            if (contact.name && contact.name.formatted) {
                displayName = contact.name.formatted;
            } else if (contact.name) {
                // Construire un nom à partir des composants disponibles
                const nameParts = [];
                if (contact.name.givenName) nameParts.push(contact.name.givenName);
                if (contact.name.familyName) nameParts.push(contact.name.familyName);
                if (nameParts.length > 0) {
                    displayName = nameParts.join(' ');
                }
            }
        }
        // Si aucun nom n'est trouvé, utiliser une valeur par défaut
        if (!displayName) {
            displayName = 'Contact sans nom';
        }
        
        // Vérifier si phoneNumbers existe et contient au moins un élément
        let phoneNumber = 'Aucun numéro';
        if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
            phoneNumber = contact.phoneNumbers[0].value;
        }
        
        items += `
            <li>
                <a href="#contactDetailsPage" data-contact-id="${i}">
                    <img src="img/person1.avif">
                    <h1>${displayName}</h1>
                    <p>${phoneNumber}</p>
                </a>
            </li>
        `;
    }
    const contactList = document.getElementById('contactList');
    contactList.innerHTML = items;
    $(contactList).listview('refresh');
}

function displayContactDetails(contactId) {
    // Stocker l'identifiant du contact actuel
    currentContactId = contactId;
    
    // Récupérer le contact par son index
    const contact = contactsData[contactId];
    if (!contact) {
        console.error('Contact non trouvé avec ID:', contactId);
        return;
    }
    
    // Déterminer le nom à afficher avec la même logique que dans showContacts
    let displayName = contact.displayName;
    if (!displayName) {
        if (contact.name && contact.name.formatted) {
            displayName = contact.name.formatted;
        } else if (contact.name) {
            const nameParts = [];
            if (contact.name.givenName) nameParts.push(contact.name.givenName);
            if (contact.name.familyName) nameParts.push(contact.name.familyName);
            if (nameParts.length > 0) {
                displayName = nameParts.join(' ');
            }
        }
    }
    if (!displayName) {
        displayName = 'Contact sans nom';
    }
    
    // Mettre à jour le nom
    $('#contactDetailName').text(displayName);
    
    // Mettre à jour le numéro de téléphone
    let phoneNumber = 'Aucun numéro';
    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
        phoneNumber = contact.phoneNumbers[0].value;
    }
    $('#contactDetailPhone').text(phoneNumber);
    
    // Vérifier et mettre à jour l'email
    if (contact.emails && contact.emails.length > 0) {
        $('#contactDetailEmail').text(contact.emails[0].value);
        $('#contactDetailEmailContainer').show();
    } else {
        $('#contactDetailEmailContainer').hide();
    }
    
    // Vérifier et mettre à jour l'adresse
    if (contact.addresses && contact.addresses.length > 0) {
        const address = contact.addresses[0];
        const addressParts = [];
        
        if (address.streetAddress) addressParts.push(address.streetAddress);
        if (address.locality) addressParts.push(address.locality);
        if (address.region) addressParts.push(address.region);
        if (address.postalCode) addressParts.push(address.postalCode);
        if (address.country) addressParts.push(address.country);
        
        if (addressParts.length > 0) {
            $('#contactDetailAddress').text(addressParts.join(', '));
            $('#contactDetailAddressContainer').show();
        } else {
            $('#contactDetailAddressContainer').hide();
        }
    } else {
        $('#contactDetailAddressContainer').hide();
    }
}

// Préparer le formulaire d'édition avec les données du contact actuel
function prepareEditForm() {
    const contact = contactsData[currentContactId];
    if (!contact) {
        console.error('Contact non trouvé pour l\'édition');
        return;
    }
    
    // Stocker l'ID du contact
    $('#editContactId').val(currentContactId);
    
    // Remplir les champs du formulaire avec les données du contact
    if (contact.name) {
        $('#editContactFirstName').val(contact.name.givenName || '');
        $('#editContactLastName').val(contact.name.familyName || '');
    }
    
    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
        $('#editContactPhone').val(contact.phoneNumbers[0].value || '');
    } else {
        $('#editContactPhone').val('');
    }
    
    if (contact.emails && contact.emails.length > 0) {
        $('#editContactEmail').val(contact.emails[0].value || '');
    } else {
        $('#editContactEmail').val('');
    }
    
    if (contact.addresses && contact.addresses.length > 0) {
        $('#editContactAddress').val(contact.addresses[0].streetAddress || '');
    } else {
        $('#editContactAddress').val('');
    }
}

// Mettre à jour un contact existant
function updateContact() {
    const contactId = $('#editContactId').val();
    if (!contactId) {
        console.error('ID de contact manquant pour la mise à jour');
        return;
    }
    
    const contact = contactsData[contactId];
    if (!contact) {
        console.error('Contact non trouvé pour la mise à jour');
        return;
    }
    
    // Récupérer les valeurs du formulaire
    const firstName = $('#editContactFirstName').val().trim();
    const lastName = $('#editContactLastName').val().trim();
    const phoneNumber = $('#editContactPhone').val().trim();
    const email = $('#editContactEmail').val().trim();
    const address = $('#editContactAddress').val().trim();
    
    // Vérifier que les champs obligatoires sont remplis
    if (!firstName || !lastName || !phoneNumber) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    // Créer un nouveau contact clone pour la mise à jour
    const updatedContact = navigator.contacts.create();
    updatedContact.id = contact.id;  // Conserver l'ID original
    
    // Mettre à jour le nom
    const name = new ContactName();
    name.givenName = firstName;
    name.familyName = lastName;
    name.formatted = firstName + ' ' + lastName;
    updatedContact.name = name;
    
    // Mettre à jour le numéro de téléphone
    const phoneNumbers = [];
    phoneNumbers[0] = new ContactField('mobile', phoneNumber, true);
    updatedContact.phoneNumbers = phoneNumbers;
    
    // Mettre à jour l'email si fourni
    if (email) {
        const emails = [];
        emails[0] = new ContactField('personal', email, true);
        updatedContact.emails = emails;
    }
    
    // Mettre à jour l'adresse si fournie
    if (address) {
        const addresses = [];
        const newAddress = new ContactAddress();
        newAddress.streetAddress = address;
        addresses[0] = newAddress;
        updatedContact.addresses = addresses;
    }
    
    // Enregistrer le contact modifié
    updatedContact.save(function() {
        // Succès
        alert('Contact mis à jour avec succès !');
        
        // Rafraîchir la liste des contacts puis retourner à la page de détails
        displayContacts();
        
        // Mettre à jour le contact dans notre tableau local
        contactsData[contactId] = updatedContact;
        
        // Naviguer vers la page de détails et mettre à jour l'affichage
        $.mobile.changePage('#contactDetailsPage');
        displayContactDetails(contactId);
    }, function(error) {
        // Erreur
        console.error('Erreur lors de la mise à jour du contact:', error);
        alert('Une erreur est survenue lors de la mise à jour du contact');
    });
}

// Supprimer un contact
function deleteContact() {
    try {
        alert('1: DÉBUT DE LA SUPPRESSION');
        
        // Récupérer les informations du contact depuis contactsData
        const contactId = currentContactId;
        alert('2: ID du contact à supprimer (index): ' + contactId);
        
        const contact = contactsData[contactId];
        alert('3: Contact trouvé? ' + (contact ? 'OUI' : 'NON'));
        
        if (!contact) {
            alert('ERREUR: Contact introuvable dans contactsData');
            return;
        }
        
        if (!contact.id) {
            alert('ERREUR: Contact sans ID valide');
            return;
        }
        
        alert('4: ID interne du contact: ' + contact.id);

        navigator.contacts.find(['id'], function(contacts) {
            alert('5: Contact trouvé: ' + contacts[0].id);
            alert('6: Contact trouvé: ' + contacts[0]);
        }, function(error) {
            alert('ERREUR: ' + error.message);
        }, new ContactFindOptions(contact.id + "", false ));
        
        try {
            alert('5: Tentative de suppression');
            
            // Utiliser directement le plugin Cordova avec l'ID du contact
            const contactToDelete = navigator.contacts.create();
            contactToDelete.id = contact.id;
            alert('6: Demarrage de la suppression ' + contactToDelete);
            // Supprimer le contact
            contactToDelete.remove(
                function() {
                    // Succès de la suppression
                    alert('7: Contact supprimé avec succès!');
                    // Rediriger vers la page d'accueil
                    $.mobile.changePage('#homePage', {
                        transition: 'slide',
                        reverse: true
                    });
                    // Rafraîchir la liste des contacts
                    setTimeout(function() {
                        displayContacts();
                    }, 300);
                },
                function(error) {
                    // Échec de la suppression
                    alert('8: Échec de la suppression: Erreur inconnue');
                    // Rediriger vers la page d'accueil
                    $.mobile.changePage('#homePage', {
                        transition: 'slide',
                        reverse: true
                    });
                    // Rafraîchir quand même
                    setTimeout(function() {
                        displayContacts();
                    }, 300);
                }
            );
        } catch(innerError) {
            alert('Erreur interne: ' + innerError.message);
            $.mobile.changePage('#homePage');
            displayContacts();
        }
    } catch (error) {
        alert('ERREUR FATALE: ' + error.message);
        $.mobile.changePage('#homePage');
    }
}

// Fonction pour créer un nouveau contact
function createNewContact() {
    // Récupérer les valeurs du formulaire
    const firstName = $('#newContactFirstName').val().trim();
    const lastName = $('#newContactLastName').val().trim();
    const phoneNumber = $('#newContactPhone').val().trim();
    const email = $('#newContactEmail').val().trim();
    const address = $('#newContactAddress').val().trim();
    
    // Vérifier que les champs obligatoires sont remplis
    if (!firstName || !lastName || !phoneNumber) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }
    
    // Créer un nouvel objet contact
    const contact = navigator.contacts.create();
    
    // Définir le nom
    const name = new ContactName();
    name.givenName = firstName;
    name.familyName = lastName;
    contact.name = name;
    
    // Définir le numéro de téléphone
    const phoneNumbers = [];
    phoneNumbers[0] = new ContactField('mobile', phoneNumber, true);
    contact.phoneNumbers = phoneNumbers;
    
    // Définir l'email si fourni
    if (email) {
        const emails = [];
        emails[0] = new ContactField('personal', email, true);
        contact.emails = emails;
    }
    
    // Définir l'adresse si fournie
    if (address) {
        const addresses = [];
        addresses[0] = new ContactAddress();
        addresses[0].streetAddress = address;
        contact.addresses = addresses;
    }
    
    // Enregistrer le contact
    contact.save(onContactSaveSuccess, onContactSaveError);
}

// Callback en cas de succès de l'enregistrement du contact
function onContactSaveSuccess() {
    // Afficher un message de succès
    alert('Contact enregistré avec succès!');
    
    // Réinitialiser le formulaire
    $('#addContactForm')[0].reset();
    
    // Retourner à la page d'accueil et rafraîchir la liste des contacts
    $.mobile.changePage('#homePage');
    displayContacts();
}

// Callback en cas d'erreur lors de l'enregistrement du contact
function onContactSaveError(error) {
    console.error('Erreur lors de l\'enregistrement du contact:', error);
    alert('Une erreur est survenue lors de l\'enregistrement du contact');
}

function onError(error) {
    console.log(error);
    alert("An unexpected error occured");
}
