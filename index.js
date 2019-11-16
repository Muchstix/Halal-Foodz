console.log("in javascript");
const contractSource = `

contract OrderNumber =

  record order =
    { creatorAddress : address,
      url            : string,
      name           : string,
      numberCount      : int }

  record state =
    { orders      : map(int, order),
      ordersLength : int }

  entrypoint init() =
    { orders = {},
      ordersLength = 0 }
  
  payable stateful entrypoint makeOrder()=
    Chain.spend(ak_2bKhoFWgQ9os4x8CaeDTHZRGzUcSwcXYUrM12gZHKTdyreGRgG,Call.value)

  entrypoint getorder(index : int) : order =
  	switch(Map.lookup(index, state.orders))
	    None    => abort("There is no order with this item registered.")
	    Some(x) => x

  stateful entrypoint registerorder(url' : string, name' : string) =
    let order = { creatorAddress = Call.caller, url = url', name = name', numberCount = 0}
    let index = getordersLength() + 1
    put(state{ orders[index] = order, ordersLength = index })

  entrypoint getordersLength() : int =
    state.ordersLength

  stateful entrypoint numberorder(index : int) =
    let order = getorder(index)
    Chain.spend(order.creatorAddress, Call.value)
    let updatednumberCount = order.numberCount + Call.value
    let updatedOrders = state.orders{ [index].numberCount = updatednumberCount }
    put(state{ orders = updatedOrders })
 

`;

//Address of the order voting smart contract on the testnet of the aeternity blockchain
const contractAddress = 'ct_25B3k7DZ2WLXMRVPZREqpviHNJXJzLe1WABAPVyGFVq4asbhQ';
//Create variable for client so it can be used in different functions
var client = null;
//Create a new global array for the orders
var orderArray = [];
//Create a new variable to store the length of the order globally
var ordersLength = 0;



//Create a asynchronous read call for our smart contract
async function callStatic(func, args) {
  //Create a new contract instance that we can interact with
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  //Make a call to get data of smart contract func, with specefied arguments
  const calledGet = await contract.call(func, args, {callStatic: true}).catch(e => console.error(e));
  //Make another call to decode the data received in first call
  const decodedGet = await calledGet.decode().catch(e => console.error(e));

  return decodedGet;
}

//Create a asynchronous write call for our smart contract
async function contractCall(func, args, value) {
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  //Make a call to write smart contract func, with aeon value input
  const calledSet = await contract.call(func, args, {amount: value}).catch(e => console.error(e));

  return calledSet;
}

//Execute main function
window.addEventListener('load', async () => {
  //Display the loader animation so the user knows that something is happening
  $("#loader").show();

  //Initialize the Aepp object through aepp-sdk.browser.js, the base app needs to be running.
  client = await Ae.Aepp();

 
  $("#loader").hide();
});

//If someone clicks to order on a order, get the input and execute the orderCall
//   jQuery("#orderBody").on("click", ".orderBtn", async function(event){
//   $("#loader").show();
//   //Create two new let block scoped variables, value for the order input and
//   //index to get the index of the order on which the user wants to order
//   let value = $(this).siblings('input').val(),
//       index = event.target.id;

//   //Promise to execute execute call for the order order function with let values
//   await contractCall('orderorder', [index], value);

//   //Hide the loading animation after async calls return a value
//   const foundIndex = orderArray.findIndex(order => order.index == event.target.id);
//   //console.log(foundIndex);
//   orderArray[foundIndex].orders += parseInt(value, 10);

//   renderorders();
//   $("#loader").hide();
// });

//If someone clicks to register a order, get the input and execute the registerCall
// $('#registerBtn').click(async function(){
//   $("#loader").show();
//   //Create two new let variables which get the values from the input fields
//   const name = ($('#regName').val()),
//         url = ($('#regUrl').val());

//   //Make the contract call to register the order with the newly passed values
//   await contractCall('registerorder', [url, name], 0);

//   //Add the new created orderobject to our orderarray
//   orderArray.push({
//     creatorName: name,
//     orderUrl: url,
//     index: orderArray.length+1,
//     orders: 0,
//   })

//   renderorders();
//   $("#loader").hide();
// });

// ************************************************
// Shopping Cart API
// ************************************************

var shoppingCart = (function() {
  // =============================
  // Private methods and propeties
  // =============================
  cart = [];
  
  // Constructor
  function Item(name, price, count) {
    this.name = name;
    this.price = price;
    this.count = count;
  }
  
  // Save cart
  function saveCart() {
    sessionStorage.setItem('shoppingCart', JSON.stringify(cart));
  }
  
    // Load cart
  function loadCart() {
    cart = JSON.parse(sessionStorage.getItem('shoppingCart'));
  }
  if (sessionStorage.getItem("shoppingCart") != null) {
    loadCart();
  }
  

  // =============================
  // Public methods and propeties
  // =============================
  var obj = {};
  
  // Add to cart
  obj.addItemToCart = function(name, price, count) {
    for(var item in cart) {
      if(cart[item].name === name) {
        cart[item].count ++;
        saveCart();
        return;
      }
    }
    var item = new Item(name, price, count);
    cart.push(item);
    saveCart();
  }
  // Set count from item
  obj.setCountForItem = function(name, count) {
    for(var i in cart) {
      if (cart[i].name === name) {
        cart[i].count = count;
        break;
      }
    }
  };
  // Remove item from cart
  obj.removeItemFromCart = function(name) {
      for(var item in cart) {
        if(cart[item].name === name) {
          cart[item].count --;
          if(cart[item].count === 0) {
            cart.splice(item, 1);
          }
          break;
        }
    }
    saveCart();
  }

  // Remove all items from cart
  obj.removeItemFromCartAll = function(name) {
    for(var item in cart) {
      if(cart[item].name === name) {
        cart.splice(item, 1);
        break;
      }
    }
    saveCart();
  }

  // Clear cart
  obj.clearCart = function() {
    cart = [];
    saveCart();
  }

  // Count cart 
  obj.totalCount = function() {
    var totalCount = 0;
    for(var item in cart) {
      totalCount += cart[item].count;
    }
    return totalCount;
  }

  // Total cart
  obj.totalCart = function() {
    var totalCart = 0;
    for(var item in cart) {
      totalCart += cart[item].price * cart[item].count;
    }
    return Number(totalCart.toFixed(2));
  }

  // List cart
  obj.listCart = function() {
    var cartCopy = [];
    for(i in cart) {
      item = cart[i];
      itemCopy = {};
      for(p in item) {
        itemCopy[p] = item[p];

      }
      itemCopy.total = Number(item.price * item.count).toFixed(2);
      cartCopy.push(itemCopy)
    }
    return cartCopy;
  }

  // cart : Array
  // Item : Object/Class
  // addItemToCart : Function
  // removeItemFromCart : Function
  // removeItemFromCartAll : Function
  // clearCart : Function
  // countCart : Function
  // totalCart : Function
  // listCart : Function
  // saveCart : Function
  // loadCart : Function
  return obj;
})();


// *****************************************
// Triggers / Events
// ***************************************** 
// Add item
$('.add-to-cart').click(function(event) {
  event.preventDefault();
  var name = $(this).data('name');
  var price = Number($(this).data('price'));
  shoppingCart.addItemToCart(name, price, 1);
  displayCart();
});

// Clear items
$('.clear-cart').click(function() {
  shoppingCart.clearCart();
  displayCart();
});


function displayCart() {
  var cartArray = shoppingCart.listCart();
  var output = "";
  for(var i in cartArray) {
    output += "<tr>"
      + "<td>" + cartArray[i].name + "</td>" 
      + "<td>(" + cartArray[i].price + ")</td>"
      + "<td><div class='input-group'><button class='minus-item input-group-addon btn btn-primary' data-name=" + cartArray[i].name + ">-</button>"
      + "<input type='number' class='item-count form-control' data-name='" + cartArray[i].name + "' value='" + cartArray[i].count + "'>"
      + "<button class='plus-item btn btn-primary input-group-addon' data-name=" + cartArray[i].name + ">+</button></div></td>"
      + "<td><button class='delete-item btn btn-danger' data-name=" + cartArray[i].name + ">X</button></td>"
      + " = " 
      + "<td>" + cartArray[i].total + "</td>" 
      +  "</tr>";
  }
  $('.show-cart').html(output);
  $('.total-cart').html(shoppingCart.totalCart());
  $('.total-count').html(shoppingCart.totalCount());
}

// Delete item button

$('.show-cart').on("click", ".delete-item", function(event) {
  var name = $(this).data('name')
  shoppingCart.removeItemFromCartAll(name);
  displayCart();
})


// -1
$('.show-cart').on("click", ".minus-item", function(event) {
  var name = $(this).data('name')
  shoppingCart.removeItemFromCart(name);
  displayCart();
})
// +1
$('.show-cart').on("click", ".plus-item", function(event) {
  var name = $(this).data('name')
  shoppingCart.addItemToCart(name);
  displayCart();
})

// Item count input
$('.show-cart').on("change", ".item-count", function(event) {
   var name = $(this).data('name');
   var count = Number($(this).val());
  shoppingCart.setCountForItem(name, count);
  displayCart();
});

$('#order_meat').click(function(){
  $("#loader").show();
  console.log("ordered meat");
 contractCall("makeOrder",[],2*1000000000000000000);
 $("#loader").hide();
});
$('#order_falafel').click(function(){
  $("#loader").show();
   console.log("orderred falafel");
  contractCall("makeOrder",[],2*1000000000000000000);
  $("#loader").hide();
});
$('#order_doro').click(function(){
  $("#loader").show();
  console.log("ordered doro");
  contractCall("makeOrder",[],3*1000000000000000000);
  $("#loader").hide();
});
$('#order_rice').click(function(){
  $("#loader").show();
  console.log("ordered rice");
  contractCall("makeOrder",[],3*1000000000000000000);
  $("#loader").hide();
});
$('#order_trey').click(function(){
  $("#loader").show();
  console.log("ordered trey-siga");
  contractCall("makeOrder",[],3*1000000000000000000);
  $("#loader").hide();
});


