/* global shoppingList, store, api, Item */

'use strict';

$(document).ready(function() {
  shoppingList.renderFromServer();
  shoppingList.bindEventListeners();
});


