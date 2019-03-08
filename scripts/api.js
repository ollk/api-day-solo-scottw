'use strict';
// eslint-disable-next-line no-unused-vars
const api = (function(){

  const BASE_URL = 'https://thinkful-list-api.herokuapp.com/scottw';

  const getItems = function(){
    return fetch(`${BASE_URL}/items`);
  };

  const createItem = function(name){

    if (!name) {
      throw new TypeError('name is empty');
    }
    const newItem = JSON.stringify({
      name
    });

    return fetch(`${BASE_URL}/items`, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: newItem,
    });
  };

  const updateItem = function(id, updateData){

    const newData = JSON.stringify(updateData);
    return fetch(`${BASE_URL}/items/${id}`, {
      method: 'PATCH',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: newData,
    });
  };

  const deleteItem = function(id){
    return fetch(`${BASE_URL}/items/${id}`, {
      method: 'DELETE',
    });
  };


  return {
    getItems,
    createItem,
    updateItem,
    deleteItem,
  };
})();