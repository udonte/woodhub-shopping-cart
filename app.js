//variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart'); 
const clearCartBtn = document.querySelector('.clear-cart'); 
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOMs = document.querySelector('.product-center');

//cart
let cart = [];

//display products
class Products {
  getProducts() {
    fetch('products.json')
  }
}

//display the UI
class UI {

}

//local storage
class Storage {

}

document.addEventListener('DOMContentLoaded', () => {
    
})

