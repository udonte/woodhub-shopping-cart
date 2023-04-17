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
              <i class="fas fa-shopping-cart"></i>
              add to cart
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
        this.addCartItem(cartItem);

        //show the cart
        this.showCart();
      }); 
    });
  };

  //get the cart, go through each of the products and take the details I want from each product in other display them
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0; 
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  //pick an item from the cart and display them
  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <img src=${item.image} alt='product'/>
        <div>
          <h4>${item.title}</h4>
          <h5>$${item.price}</h5>
          <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div>
          <i class="fas fa-chevron-up" data-id=${item.id}></i>
          <p class="item-amount">${item.amount}</p>
          <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>
      `;
    cartContent.appendChild(div);
  }

  //show the cart when needed
  showCart() {
    cartOverlay.classList.add('transparentBcg');
    cartDOM.classList.add('show-cart');
  }

  //setup application
  setupAPP() {
    cart = Storage.getCart(); //get the cart is in the local storage
    this.setCartValues(cart); //go through each of the products and take the details I want from each product in order to display them
    this.populateCart(cart); //render the cart on the cart display
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click',this.hideCart);
    
  }
  //get the whatever is in the cart/local storage in order to render them in the cart display
  populateCart(cart) {   
    //run through the cart and call that method we have written before on each cart item 
    cart.forEach(item => this.addCartItem(item));
  }

  //hide the cart when needed
  hideCart() {
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('show-cart');
  }

  //logic for the cart
  cardLogic() {
    //clear cart button
    clearCartBtn.addEventListener('click', () => {
      this.clearCart();
    });
    //cart functionality
    cartContent.addEventListener('click', event => {
      //check the event, find a class with the required name
      if (event.target.classList.contains('remove-item')) {
        let removeItem = event.target; //set the target to a variable
        let id = removeItem.dataset.id; //get the id of the target
        cartContent.removeChild(removeItem.parentElement.parentElement) //go two places (or two divs) up the DOM and remove that div
        this.removeItem(id);
      }
      //increase the amount
      else if (event.target.classList.contains('fa-chevron-up')) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      }
      //decrease the amount 
      else if (event.target.classList.contains('fa-chevron-down')) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
         let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        }
        else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });   
  }
  
  clearCart() {
    //loop over all the items in the cart, and apply the removeItem method on them
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  //go througn the cart and get an item and check if the i
  removeItem(id) {
    cart = cart.filter(item => item.id != id)
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class='fas fa-shopping-cart'></i>add to cart`;
  }

  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }
}

//local storage
class Storage {
 
  //static method that can only be applied to this class
  static saveProducts(products) {
    localStorage.setItem("products",  JSON.stringify(products));
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

  //get whatever is in the local storage
  static getCart() {
    //if there are items in the cart return the card, return the cart else assign an array
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
  }
}

//load the products
document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();
  const products = new Products();

  //setup application
  ui.setupAPP();
 
  //get all products
  products.getProducts().then(products => {
    ui.displayProducts(products); //load the product to the display
    Storage.saveProducts(products); //load the products to the local storage
  }).then(() => {
    ui.getBagButtons();
    ui.cardLogic();
  });
});
