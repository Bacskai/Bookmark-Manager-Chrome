document.addEventListener('DOMContentLoaded', function () {
    const bookmarkForm = document.getElementById('bookmarkForm');
    const saveButton = document.getElementById('saveBookmark');
    saveButton.addEventListener('click', saveBookmark);
  
    const feedbackForm = document.getElementById('feedbackForm');
    const sendFeedbackButton = document.getElementById('sendFeedback');
    sendFeedbackButton.addEventListener('click', sendFeedback);
  
    const languageSelector = document.getElementById('languageSelector');
    languageSelector.addEventListener('change', changeLanguage);
  
    const defaultLanguage = 'en';
    chrome.storage.sync.get(['language'], function (result) {
      const savedLanguage = result.language;
      const languageToUse = savedLanguage || defaultLanguage;
      languageSelector.value = languageToUse;
      changeLanguage();
    });
  
    const deleteBookmarksButton = document.getElementById('deleteBookmarks');
    deleteBookmarksButton.addEventListener('click', deleteAllBookmarks);
  
    const autofillButton = document.getElementById('autofillBookmark');
    autofillButton.addEventListener('click', autofillUrl);
  
    displayBookmarks();
  });
  
  function saveBookmark() {
    const title = document.getElementById('title').value;
    const url = document.getElementById('url').value;
    const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());
    const notes = document.getElementById('notes').value;
  
    if (title === "") {
      alert(getLanguageText('titleRequired'));
      return;
    }
  
    if (!isValidURL(url)) {
      alert(getLanguageText('invalidURL'));
      return;
    }
  
    chrome.storage.sync.get(['bookmarks'], function (result) {
      const bookmarks = result.bookmarks || [];
      const newBookmark = { id: generateUniqueId(), title, url, tags, notes };
      bookmarks.push(newBookmark);
      chrome.storage.sync.set({ bookmarks }, function () {
        displayBookmarks();
        clearForm();
      });
    });
  }
  
  function isValidURL(inputURL) {
    try {
      new URL(inputURL);
      return true;
    } catch (_) {
      return false;
    }
  }
  
  function autofillUrl() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      const urlInput = document.getElementById('url');
      urlInput.value = tab.url;
    });
  }
  
  function displayBookmarks() {
    chrome.storage.sync.get(['bookmarks'], function (result) {
      const bookmarks = result.bookmarks || [];
      const bookmarkList = document.getElementById('bookmarkList');
      bookmarkList.innerHTML = '';
  
      if (bookmarks.length === 0) {
        bookmarkList.innerHTML = '<p>No saved bookmarks.</p>';
      } else {
        for (const bookmark of bookmarks) {
          const bookmarkItem = document.createElement('div');
          bookmarkItem.classList.add('bookmark-item');
  
          const titleElement = document.createElement('a');
          titleElement.textContent = bookmark.title;
          titleElement.href = bookmark.url;
          titleElement.target = '_blank';
  
          const tagsElement = document.createElement('p');
          tagsElement.textContent = getLanguageText('tags') + ': ' + bookmark.tags.join(', ');
  
          const notesElement = document.createElement('p');
          notesElement.textContent = getLanguageText('notes') + ': ' + bookmark.notes;
  
          const deleteBookmarkButton = document.createElement('button');
          deleteBookmarkButton.textContent = getLanguageText('delete');
          deleteBookmarkButton.dataset.bookmarkId = bookmark.id;
          deleteBookmarkButton.addEventListener('click', deleteBookmark);
  
          bookmarkItem.appendChild(titleElement);
          bookmarkItem.appendChild(tagsElement);
          bookmarkItem.appendChild(notesElement);
          bookmarkItem.appendChild(deleteBookmarkButton);
          bookmarkList.appendChild(bookmarkItem);
        }
      }
    });
  }
  
  function deleteAllBookmarks() {
    if (confirm(getLanguageText('confirmDeleteAll'))) {
      chrome.storage.sync.set({ bookmarks: [] }, function () {
        displayBookmarks();
      });
    }
  }
  
  function deleteBookmark(event) {
    const bookmarkId = event.target.dataset.bookmarkId;
    chrome.storage.sync.get(['bookmarks'], function (result) {
      const bookmarks = result.bookmarks || [];
      const updatedBookmarks = bookmarks.filter(b => b.id !== bookmarkId);
      chrome.storage.sync.set({ bookmarks: updatedBookmarks }, function () {
        displayBookmarks();
      });
    });
  }
  
  function sendFeedback() {
    const feedbackText = document.getElementById('feedbackText').value;
    if (feedbackText === "") {
      alert(getLanguageText('messageRequired'));
      return;
    }
  
    // Here you can implement sending the feedback through an API or other means
    // Example: console.log('Feedback:', feedbackText);
  
    // Feedback confirmation to the user
    alert(getLanguageText('feedbackConfirmation'));
    // Clear the form
    document.getElementById('feedbackText').value = '';
  }
  
  function changeLanguage() {
    const selectedLanguage = languageSelector.value;
    chrome.storage.sync.set({ language: selectedLanguage });
  
    const pageTitle = document.querySelector('title');
    const bookmarkFormTitle = document.getElementById('bookmarkFormTitle');
    const feedbackFormTitle = document.getElementById('feedbackFormTitle');
    const saveButton = document.getElementById('saveBookmark');
    const sendFeedbackButton = document.getElementById('sendFeedback');
    const deleteBookmarksButton = document.getElementById('deleteBookmarks');
    const autofillButton = document.getElementById('autofillBookmark');
  
    pageTitle.textContent = getLanguageText('pageTitle');
    bookmarkFormTitle.textContent = getLanguageText('bookmarkFormTitle');
    feedbackFormTitle.textContent = getLanguageText('feedbackFormTitle');
    saveButton.textContent = getLanguageText('save');
    sendFeedbackButton.textContent = getLanguageText('send');
    deleteBookmarksButton.textContent = getLanguageText('deleteAllBookmarks');
    autofillButton.textContent = getLanguageText('autofillBookmark');
  }
  
  function clearForm() {
    document.getElementById('title').value = '';
    document.getElementById('url').value = '';
    document.getElementById('tags').value = '';
    document.getElementById('notes').value = '';
  }
  
  function getLanguageText(key) {
    const selectedLanguage = languageSelector.value;
    const languageData = languageTexts[selectedLanguage] || languageTexts['en'];
    return languageData[key] || languageTexts['en'][key];
  }
  
  function generateUniqueId() {
    return 'bookmark_' + new Date().getTime();
  }
  
  const languageTexts = {
    'en': {
      'pageTitle': 'Bookmark Manager Extension',
      'bookmarkFormTitle': 'Add New Bookmark',
      'feedbackFormTitle': 'Send Feedback',
      'save': 'Save',
      'send': 'Send',
      'delete': 'Delete',
      'deleteAllBookmarks': 'Delete All Bookmarks',
      'autofillBookmark': 'Insert URL',
      'titleRequired': 'Title field is required!',
      'invalidURL': 'Invalid URL format!',
      'tags': 'Tags',
      'notes': 'Notes',
      'confirmDeleteAll': 'Are you sure you want to delete all bookmarks?',
      'messageRequired': 'The message field is required!',
      'feedbackConfirmation': 'Thank you for your feedback!'
    },
    'hu': {
      'pageTitle': 'Könyvjelző Kezelő Kiegészítő',
      'bookmarkFormTitle': 'Új Könyvjelző Hozzáadása',
      'feedbackFormTitle': 'Visszajelzés Küldése',
      'save': 'Mentés',
      'send': 'Küldés',
      'delete': 'Törlés',
      'deleteAllBookmarks': 'Összes Könyvjelző Törlése',
      'autofillBookmark': 'URL Beillesztése',
      'titleRequired': 'A cím mező kitöltése kötelező!',
      'invalidURL': 'Érvénytelen URL formátum!',
      'tags': 'Címkék',
      'notes': 'Megjegyzések',
      'confirmDeleteAll': 'Biztosan törölni szeretnéd az összes könyvjelzőt?',
      'messageRequired': 'A üzenet mező kitöltése kötelező!',
      'feedbackConfirmation': 'Köszönjük a visszajelzést!'
    },
    'de': {
      'pageTitle': 'Lesezeichen-Manager Erweiterung',
      'bookmarkFormTitle': 'Neues Lesezeichen hinzufügen',
      'feedbackFormTitle': 'Feedback senden',
      'save': 'Speichern',
      'send': 'Senden',
      'delete': 'Löschen',
      'deleteAllBookmarks': 'Alle Lesezeichen löschen',
      'autofillBookmark': 'URL einfügen',
      'titleRequired': 'Titelfeld ist erforderlich!',
      'invalidURL': 'Ungültiges URL-Format!',
      'tags': 'Schlagworte',
      'notes': 'Notizen',
      'confirmDeleteAll': 'Möchten Sie wirklich alle Lesezeichen löschen?',
      'messageRequired': 'Das Nachrichtenfeld ist erforderlich!',
      'feedbackConfirmation': 'Vielen Dank für Ihr Feedback!'
    },
    'es': {
      'pageTitle': 'Extensión de Administrador de Marcadores',
      'bookmarkFormTitle': 'Agregar nuevo marcador',
      'feedbackFormTitle': 'Enviar Comentarios',
      'save': 'Guardar',
      'send': 'Enviar',
      'delete': 'Eliminar',
      'deleteAllBookmarks': 'Eliminar todos los marcadores',
      'autofillBookmark': 'Insertar URL',
      'titleRequired': '¡El campo de título es obligatorio!',
      'invalidURL': '¡Formato de URL no válido!',
      'tags': 'Etiquetas',
      'notes': 'Notas',
      'confirmDeleteAll': '¿Estás seguro de que quieres eliminar todos los marcadores?',
      'messageRequired': '¡El campo de mensaje es obligatorio!',
      'feedbackConfirmation': '¡Gracias por tus comentarios!'
    }
    // Add more language texts if necessary
  };
  