 //variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart'); 
const clearCartBtn = document.querySelector('.clear-cart'); 
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

//cart
let cart = [];

//buttons
let buttonsDOM = [];

//display products
class Products {
  //get the products from local file or api as need be
  async getProducts() {
    try {
      let response = await fetch('products.json');
      let data = await response.json(); //converts to json

      let products = data.items; //get the actual object data
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { id, title, price, image }
      });
      return products;
      
    } catch (error) {
      console.log(error)
    }
  }
}

//display the UI
class UI {

  //method display the UI
  displayProducts(products) {
    let result = '';
    products.forEach((product) => {
      result += `
        <!-- single product -->
        <article class="product">
          <div class="img-container">
            <img
              src=${product.image}
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping"></i>
              add to bag
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>
      <!-- single product -->
      `;
    });
    productsDOM.innerHTML = result;
  }

  //method to get the bag buttons
  getBagButtons() {
    //converts the nodelist to an actual array
    const bagButtons = [...document.querySelectorAll('.bag-btn')];
    buttonsDOM = bagButtons;
    bagButtons.forEach((button) => {
      let id = button.dataset.id; //gets the id for each button using the dataset attribute
      //if an items is in the cart, make its button unclickable and show that its in the cart
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerText = 'in Cart';
        button.disabled = true;
      }

      //if its not in the cart, on clicking the item, make its button unclickable and show that its in the cart
      button.addEventListener('click', (event) => {
        event.target.innerText = 'In Cart';
        event.target.disabled = true;

        //get product from products
        let cartItem = { ...Storage.getProducts(id), amount: 1 };
        
        //add product to cart
        cart = [...cart, cartItem];

        //save cart in local storage
        Storage.saveCart(cart);

        //set cart values
        this.setCartValues(cart); //updated cart values
        //display cart items
        //show the cart
      });
    })
  };

  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
    console.log(cartTotal, cartItems);
  }

}

//local storage
class Storage {

  //static method that can only be applied to this class
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  //get the product 
  static getProducts(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    //checks if an id of a products in saved product is the same as the id that was passed. The ultimately idea is to check if clicked product is in the saved products. 
    return products.find(product => product.id === id);
  }

  //save whatever is in cart into the local storage
  static saveCart(cart){
    localStorage.setItem('cart', JSON.stringify(cart))
  }

  
}

//load the products
document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();
  const products = new Products();

  //get all products
  products.getProducts().then(products => {
    ui.displayProducts(products); //load the product to the display
    Storage.saveProducts(products); //load the products to the local storage
  }).then(() => {
    ui.getBagButtons();
  })
});

