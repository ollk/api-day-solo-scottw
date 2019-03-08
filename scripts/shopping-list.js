'use strict';
/* global store, api $, */

// eslint-disable-next-line no-unused-vars
const shoppingList = (function(){

  function generateItemElement(item) {
    const checkedClass = item.checked ? 'shopping-item__checked' : '';
    const editBtnStatus = item.checked ? 'disabled' : '';

    let itemTitle = `<span class="shopping-item ${checkedClass}">${item.name}</span>`;
    if (item.isEditing) {
      itemTitle = `
        <form class="js-edit-item">
          <input class="shopping-item type="text" value="${item.name}" />
        </form>
      `;
    }
  
    return `
      <li class="js-item-element" data-item-id="${item.id}">
        ${itemTitle}
        <div class="shopping-item-controls">
          <button class="shopping-item-edit js-item-edit" ${editBtnStatus}>
            <span class="button-label">edit</span>
          </button>
          <button class="shopping-item-toggle js-item-toggle">
            <span class="button-label">check</span>
          </button>
          <button class="shopping-item-delete js-item-delete">
            <span class="button-label">delete</span>
          </button>
        </div>
      </li>`;
  }
  
  
  function generateShoppingItemsString(shoppingList) {
    const items = shoppingList.map((item) => generateItemElement(item));
    return items.join('');
  }
  
  

  function render() {
    // Filter item list if store prop is true by item.checked === false
    let items = [ ...store.items ];

    if(store.errorMessage) {
      $('.js-error-message').html(`<p>ERROR: ${store.errorMessage}</p>`);
      $('.js-error-message').removeClass('hidden');
    }

    if(!store.errorMessage) {
      $('.js-error-message').html('');
      $('.js-error-message').addClass('hidden');
    }

    if (store.hideCheckedItems) {
      items = items.filter(item => !item.checked);
    }
  
    // Filter item list if store prop `searchTerm` is not empty
    if (store.searchTerm) {
      items = items.filter(item => item.name.includes(store.searchTerm));
    }
  
    // render the shopping list in the DOM
    console.log('`render` ran');
    const shoppingListItemsString = generateShoppingItemsString(items);
  
    // insert that HTML into the DOM
    $('.js-shopping-list').html(shoppingListItemsString);
  }

  const renderFromServer = function() {
    let error =null;
    api.getItems()
      .then(res => {
        if (!res.ok) {
          error = {code: res.status};
        }
        return res.json();
      })
      .then((items) => {
        if (error) {
          return handleErrors(error, items);
        }
        items.forEach((item) => store.addItem(item));
        console.log('renderFromServer ran', store.items);
        render();
      });
  };

  const handleErrors = function(error, data) {
    error.message = data.message;
    store.setErrorMessage(error.message);
    render();
    store.setErrorMessage('');
    return Promise.reject(error);
  };
  
  
  function handleNewItemSubmit() {
    $('#js-shopping-list-form').submit(function (event) {
      event.preventDefault();
      const newItemName = $('.js-shopping-list-entry').val();
      $('.js-shopping-list-entry').val('');
      let error = null;
      api.createItem(newItemName)
        .then(res => {
          if (!res.ok){
            error = {code: res.status};
          }
          return res.json();
        })
        .then((newItem) => {
          if (error) {
            return handleErrors(error, newItem);
          }
          
          store.addItem(newItem);
          render();
        });
    });
  }
  
  function getItemIdFromElement(item) {
    return $(item)
      .closest('.js-item-element')
      .data('item-id');
  }

  function getCheckedStatusFromStore(id) {
    const target = store.items.find(item => item.id === id);
    return target.checked;
  }
  
  function handleItemCheckClicked() {
    $('.js-shopping-list').on('click', '.js-item-toggle', event => {
      const id = getItemIdFromElement(event.currentTarget);
      const checkedStatus = getCheckedStatusFromStore(id);
      let error = null;
      api.updateItem(id, {checked: !checkedStatus})
        .then((res) => {
          if (!res.ok) {
            error = {code: res.status};
          }
          return res.json();
        })
        .then(data => {
          if (error) {
            return handleErrors(error, data);
          }
          store.findAndUpdate(id, {checked: !checkedStatus});
          render();
        });
    });
  }
  
  function handleDeleteItemClicked() {
    $('.js-shopping-list').on('click', '.js-item-delete', event => {
      const id = getItemIdFromElement(event.currentTarget);
      let error = null;
      api.deleteItem(id)
        .then((res)=> {
          if (!res.ok) {
            error = {code: res.status};
          }
          return res.json();
        })
        .then(data => {
          if (error) {
            return handleErrors(error, data);
          }
          store.findAndDelete(id);
          render();
        }); 
    });
  }
  
  function handleEditShoppingItemSubmit() {
    $('.js-shopping-list').on('submit', '.js-edit-item', event => {
      event.preventDefault();
      const id = getItemIdFromElement(event.currentTarget);
      const itemName = $(event.currentTarget).find('.shopping-item').val();
      let error = null;
      api.updateItem(id, {name: itemName})
        .then((res) => {
          if (!res.ok) {
            error = {code: res.status};
          }
          return res.json();
        })
        .then(data => {
          if (error) {
            return handleErrors(error, data);
          }
          store.findAndUpdate(id, {name: itemName});
          store.setItemIsEditing(id, false);
          render();
        });
    });
  }
  
  function handleToggleFilterClick() {
    $('.js-filter-checked').click(() => {
      store.toggleCheckedFilter();
      render();
    });
  }
  
  function handleShoppingListSearch() {
    $('.js-shopping-list-search-entry').on('keyup', event => {
      const val = $(event.currentTarget).val();
      store.setSearchTerm(val);
      render();
    });
  }

  function handleItemStartEditing() {
    $('.js-shopping-list').on('click', '.js-item-edit', event => {
      const id = getItemIdFromElement(event.target);
      store.setItemIsEditing(id, true);
      render();
    });
  }
  
  function bindEventListeners() {
    handleNewItemSubmit();
    handleItemCheckClicked();
    handleDeleteItemClicked();
    handleEditShoppingItemSubmit();
    handleToggleFilterClick();
    handleShoppingListSearch();
    handleItemStartEditing();
  }

  // This object contains the only exposed methods from this module:
  return {
    render: render,
    bindEventListeners: bindEventListeners,
    renderFromServer,

    handleErrors,
  };
}());
