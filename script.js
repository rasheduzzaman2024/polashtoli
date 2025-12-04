// --- Data and State (equivalent to React's useState) ---

let currentPage = 'landing';
let user = null;
let view = 'home';
let cart = [];
let editingProduct = null; // Used for CRUD modal

let customers = [
    { email: 'admin@polashtoli.com', password: 'admin123', role: 'admin', name: 'Admin' }
];
let products = [
    { id: 1, name: 'Traditional Saree', price: 2500, category: 'Clothing', image: '👗', stock: 15, description: 'Beautiful traditional Bengali saree' },
    { id: 2, name: 'Leather Bag', price: 1200, category: 'Accessories', image: '👜', stock: 8, description: 'Handcrafted leather bag' },
    { id: 3, name: 'Pottery Set', price: 850, category: 'Home', image: '🏺', stock: 12, description: 'Traditional clay pottery set' },
    { id: 4, name: 'Handicraft Wall Art', price: 3200, category: 'Decor', image: '🖼️', stock: 5, description: 'Handmade wall decoration' },
    { id: 5, name: 'Cotton Kurta', price: 900, category: 'Clothing', image: '👔', stock: 20, description: 'Comfortable cotton kurta' },
    { id: 6, name: 'Jute Basket', price: 450, category: 'Home', image: '🧺', stock: 25, description: 'Eco-friendly jute basket' },
];
let orders = [];
let searchQuery = '';

// --- Utility Functions ---

const getCartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);
const getCartTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

// --- Auth & Cart Logic Functions ---

function handleSignIn(email, password) {
    const customer = customers.find(c => c.email === email && c.password === password);
    if (customer) {
        user = customer;
        currentPage = 'app';
        view = 'home';
        renderApp();
    } else {
        alert('Invalid credentials!');
    }
}

function logout() {
    user = null;
    cart = [];
    currentPage = 'landing';
    view = 'home';
    renderApp();
}

/** * Makes the homepage dynamic by adding product to cart and immediately
 * refreshing the current view (Home or Cart) and Header (for badge count).
 */
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock === 0) return;

    // Optional: Reduce stock count locally (for a more complete simulation)
    // product.stock--; 

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        cart = cart.map(item =>
            item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    // Rerender only necessary parts for efficiency
    renderHeader(); 
    if (view === 'home') renderHomeView(); 
    if (view === 'cart') renderCartView(); 
}

function updateQuantity(id, delta) {
    cart = cart.map(item => {
        if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
    }).filter(item => item.quantity > 0);
    renderApp(); // Rerenders cart and header
}

function removeFromCart(id) {
    if (confirm('Remove item from cart?')) {
        cart = cart.filter(item => item.id !== id);
        renderApp();
    }
}

function checkout() {
    if (cart.length === 0) return;
    const order = {
        id: Date.now(),
        customerEmail: user.email,
        items: JSON.parse(JSON.stringify(cart)), 
        total: getCartTotal(),
        date: new Date().toLocaleString(),
        status: 'Pending'
    };
    orders.push(order);
    cart = [];
    alert('Order placed successfully! 🎉');
    view = 'orders';
    renderApp();
}

// --- Admin CRUD Logic ---

function createProduct(data) {
    products.push({ ...data, id: Date.now(), price: Number(data.price), stock: Number(data.stock) });
    editingProduct = null;
    renderApp();
}

function updateProduct(updated) {
    products = products.map(p => p.id === updated.id ? { ...updated, price: Number(updated.price), stock: Number(updated.stock) } : p);
    editingProduct = null;
    renderApp();
}

function deleteProduct(id) {
    if (confirm('Delete this product?')) {
        products = products.filter(p => p.id !== id);
        renderApp();
    }
}

// --- Rendering Functions (DOM Manipulation - Same as previous response) ---

function renderHeader() {
    const headerEl = document.getElementById('header');
    if (currentPage !== 'app' || !user) {
        headerEl.innerHTML = '';
        return;
    }

    const cartCount = getCartCount();
    const isAdmin = user.role === 'admin';
    
    // Using simple HTML structure for the header
    headerEl.innerHTML = `
        <div class="header-content">
            <div class="logo">
                <h1 onclick="setView('home')" style="cursor: pointer;">🌺 পলাশতলি</h1>
                <p style="font-size: 10px;">Polashtoli Market</p>
            </div>
            <div class="nav-buttons">
                <span style="margin-right: 15px;">Hello, **${user.name}**!</span>
                <button onclick="setView('home')">Home</button>
                ${!isAdmin ? `
                    <button onclick="setView('cart')" style="position: relative;">
                        Cart ${cartCount > 0 ? `<span class="cart-badge">${cartCount}</span>` : ''}
                    </button>
                    <button onclick="setView('orders')">Orders</button>
                ` : `
                    <button onclick="setView('admin')">Manage Products</button>
                    <button onclick="setView('all-orders')">All Orders</button>
                `}
                <button onclick="logout()">Logout</button>
            </div>
        </div>
    `;
}

// ... (renderLandingPage, renderSignInPage, attemptSignIn, renderSignUpPage, attemptSignUp functions remain the same) ...

function renderLandingPage() {
    const container = document.getElementById('app-container');
    container.className = 'auth-page';
    container.innerHTML = `
        <div class="auth-card" style="text-align: center;">
            <div style="font-size: 60px; margin-bottom: 20px;">🌺</div>
            <h2 style="font-size: 30px; font-weight: bold; color: #333;">Welcome to Polashtoli</h2>
            <p style="margin-bottom: 30px;">Your Trusted Online Marketplace</p>
            <button class="btn-primary" style="margin-bottom: 15px;" onclick="setCurrentPage('signup')">Get Started</button>
            <button class="btn-primary" style="background-color: #ff5722;" onclick="setCurrentPage('signin')">Sign In</button>
        </div>
    `;
}

function renderSignInPage() {
    const container = document.getElementById('app-container');
    container.className = 'auth-page';
    container.innerHTML = `
        <div class="auth-card">
            <div style="font-size: 40px; margin-bottom: 10px;">🔑</div>
            <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">Sign In</h2>
            <input type="email" id="signin-email" placeholder="Email" value="admin@polashtoli.com">
            <input type="password" id="signin-password" placeholder="Password" value="admin123">
            <button class="btn-primary" onclick="attemptSignIn()">Sign In</button>
            <p style="margin-top: 15px; font-size: 14px;">Demo: **admin@polashtoli.com** / **admin123**</p>
            <button style="margin-top: 20px; border: none; background: none; color: #ff5722;" onclick="setCurrentPage('signup')">Need an account? Sign Up</button>
            <button style="border: none; background: none; color: #777;" onclick="setCurrentPage('landing')">← Back to Home</button>
        </div>
    `;
}

function attemptSignIn() {
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    handleSignIn(email, password);
}

function renderSignUpPage() {
    const container = document.getElementById('app-container');
    container.className = 'auth-page';
    container.innerHTML = `
        <div class="auth-card">
            <div style="font-size: 40px; margin-bottom: 10px;">📝</div>
            <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">Create Account</h2>
            <input type="text" id="signup-name" placeholder="Full Name">
            <input type="email" id="signup-email" placeholder="Email">
            <input type="password" id="signup-password" placeholder="Password">
            <button class="btn-primary" onclick="attemptSignUp()">Sign Up</button>
            <button style="margin-top: 20px; border: none; background: none; color: #ff5722;" onclick="setCurrentPage('signin')">Already have an account? Sign In</button>
            <button style="border: none; background: none; color: #777;" onclick="setCurrentPage('landing')">← Back to Home</button>
        </div>
    `;
}

function attemptSignUp() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (!name || !email || !password) {
        alert('Please fill all fields.');
        return;
    }

    const exists = customers.some(c => c.email === email);
    if (exists) {
        alert('Email already registered!');
        return;
    }

    customers.push({ name, email, password, role: 'customer' });
    alert('Account created successfully! Please sign in.');
    setCurrentPage('signin');
}


function renderProductCard(product, isAdmin) {
    // This function provides the dynamic HTML for a single product card
    const btnHtml = isAdmin ? `
        <div class="flex space-x-4">
            <button class="btn-primary" style="background-color: #2196F3; flex: 1;" onclick="editProduct(${product.id})">Edit</button>
            <button class="btn-primary" style="background-color: #F44336; flex: 1;" onclick="deleteProduct(${product.id})">Delete</button>
        </div>
    ` : `
        <button 
            class="btn-add-to-cart" 
            onclick="addToCart(${product.id})"
            ${product.stock === 0 ? 'disabled' : ''}
            style="${product.stock === 0 ? 'background-color: #ccc; cursor: not-allowed;' : ''}"
        >
            ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
    `;

    return `
        <div class="product-card">
            <div class="product-emoji">${product.image}</div>
            <h3 style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">${product.name}</h3>
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">${product.description}</p>
            <div class="flex justify-between items-center" style="margin-bottom: 10px;">
                <span class="product-price">৳${product.price}</span>
                <span style="font-size: 12px; color: #777;">Stock: ${product.stock}</span>
            </div>
            <span style="display: inline-block; background-color: #ffccbc; color: #d84315; font-size: 12px; padding: 2px 5px; border-radius: 3px; margin-bottom: 10px;">
                ${product.category}
            </span>
            ${btnHtml}
        </div>
    `;
}

function renderHomeView() {
    const container = document.getElementById('app-container');
    container.className = 'container';
    
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const productsHtml = filtered.map(p => renderProductCard(p, false)).join('');

    container.innerHTML = `
        <div style="margin-bottom: 20px; position: relative;">
            <input 
                type="text" 
                placeholder="Search products..." 
                value="${searchQuery}"
                oninput="setSearchQuery(this.value)"
                style="width: 100%; padding: 10px 10px 10px 40px; border: 1px solid #ccc; border-radius: 4px;"
            />
            <span style="position: absolute; left: 10px; top: 10px;">🔍</span>
        </div>
        <div class="product-grid">
            ${productsHtml || '<p class="text-center text-gray">No products found.</p>'}
        </div>
    `;
}

function setSearchQuery(query) {
    searchQuery = query;
    renderApp();
}

function renderCartView() {
    const container = document.getElementById('app-container');
    container.className = 'container';
    const cartHtml = cart.length === 0 ? `
        <div class="text-center" style="padding: 50px; background-color: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
            <div style="font-size: 60px; color: #ccc; margin-bottom: 10px;">🛒</div>
            <p style="color: #666;">Your cart is empty.</p>
        </div>
    ` : cart.map(item => `
        <div class="cart-item">
            <div style="font-size: 30px;">${item.image}</div>
            <div class="cart-item-details">
                <p style="font-weight: bold;">${item.name}</p>
                <p class="product-price" style="font-size: 16px;">৳${item.price} x ${item.quantity}</p>
                <p style="font-weight: bold; color: #ff5722;">Subtotal: ৳${item.price * item.quantity}</p>
            </div>
            <div class="quantity-control">
                <button onclick="updateQuantity(${item.id}, -1)">-</button>
                <span style="font-weight: bold;">${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <button onclick="removeFromCart(${item.id})" style="margin-left: 15px; color: #F44336; border: none; background: none; cursor: pointer;">
                ❌
            </button>
        </div>
    `).join('');

    container.innerHTML = `
        <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">Shopping Cart</h2>
        ${cartHtml}
        ${cart.length > 0 ? `
            <div class="checkout-box">
                <div class="flex justify-between" style="font-size: 20px; font-weight: bold; margin-bottom: 15px;">
                    <span>Total:</span>
                    <span style="color: #ff5722;">৳${getCartTotal()}</span>
                </div>
                <button class="btn-primary" onclick="checkout()">Place Order</button>
            </div>
        ` : ''}
    `;
}

function renderOrdersView() {
    const container = document.getElementById('app-container');
    container.className = 'container';
    
    const customerOrders = orders.filter(o => o.customerEmail === user.email);
    const ordersHtml = customerOrders.length === 0 ? `
        <div class="text-center" style="padding: 50px; background-color: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
            <div style="font-size: 60px; color: #ccc; margin-bottom: 10px;">📦</div>
            <p style="color: #666;">No orders placed yet.</p>
        </div>
    ` : customerOrders.map(order => `
        <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); margin-bottom: 15px;">
            <div class="flex justify-between items-center" style="margin-bottom: 10px;">
                <p style="font-weight: bold;">Order #${order.id}</p>
                <span style="background-color: #fffde7; color: #fbc02d; padding: 5px 10px; border-radius: 4px; font-size: 12px;">${order.status}</span>
            </div>
            <p style="font-size: 12px; color: #777; margin-bottom: 10px;">Date: ${order.date}</p>
            <ul style="list-style: none; padding: 0; margin: 0 0 10px 0; border-top: 1px dashed #ccc; padding-top: 10px;">
                ${order.items.map(item => `
                    <li class="flex justify-between" style="font-size: 14px; margin-bottom: 5px;">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>৳${item.price * item.quantity}</span>
                    </li>
                `).join('')}
            </ul>
            <div class="flex justify-between" style="font-weight: bold; border-top: 1px solid #ccc; padding-top: 10px;">
                <span>Total:</span>
                <span style="color: #ff5722;">৳${order.total}</span>
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">My Orders</h2>
        ${ordersHtml}
    `;
}


function renderAdminView() {
    const container = document.getElementById('app-container');
    container.className = 'container';
    
    const productsHtml = products.map(p => renderProductCard(p, true)).join('');

    container.innerHTML = `
        <div class="flex justify-between items-center" style="margin-bottom: 20px;">
            <h2 style="font-size: 24px; font-weight: bold;">Product Management (CRUD)</h2>
            <button class="btn-primary" style="background-color: #4CAF50; width: auto;" onclick="setEditingProduct({})">➕ Add Product</button>
        </div>
        <div class="product-grid">
            ${productsHtml || '<p class="text-center text-gray">No products available.</p>'}
        </div>
    `;
    renderProductFormModal();
}

function renderAllOrdersView() {
    const container = document.getElementById('app-container');
    container.className = 'container';
    
    const allOrdersHtml = orders.length === 0 ? `
        <div class="text-center" style="padding: 50px; background-color: white; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
            <div style="font-size: 60px; color: #ccc; margin-bottom: 10px;">📦</div>
            <p style="color: #666;">No orders placed yet.</p>
        </div>
    ` : orders.map(order => `
        <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); margin-bottom: 15px;">
            <div class="flex justify-between items-center" style="margin-bottom: 10px;">
                <div>
                    <p style="font-weight: bold;">Order #${order.id}</p>
                    <p style="font-size: 12px; color: #777;">Customer: ${order.customerEmail}</p>
                </div>
                <span style="background-color: #fffde7; color: #fbc02d; padding: 5px 10px; border-radius: 4px; font-size: 12px;">${order.status}</span>
            </div>
            <p style="font-size: 12px; color: #777; margin-bottom: 10px;">Date: ${order.date}</p>
            <ul style="list-style: none; padding: 0; margin: 0 0 10px 0; border-top: 1px dashed #ccc; padding-top: 10px;">
                ${order.items.map(item => `
                    <li class="flex justify-between" style="font-size: 14px; margin-bottom: 5px;">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>৳${item.price * item.quantity}</span>
                    </li>
                `).join('')}
            </ul>
            <div class="flex justify-between" style="font-weight: bold; border-top: 1px solid #ccc; padding-top: 10px;">
                <span>Total:</span>
                <span style="color: #ff5722;">৳${order.total}</span>
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">All Orders (Admin View)</h2>
        ${allOrdersHtml}
    `;
}

function renderProductFormModal() {
    const modalContainer = document.getElementById('modal-container');
    if (!editingProduct && editingProduct !== null) return; 

    const isEditing = editingProduct && editingProduct.id;
    const productData = isEditing ? editingProduct : { name: '', price: '', category: '', image: '🛍️', stock: '', description: '' };

    modalContainer.innerHTML = `
        <div id="product-modal" class="modal-backdrop ${editingProduct === null ? 'hidden' : ''}" style="position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
            <div style="background-color: white; padding: 25px; border-radius: 8px; width: 100%; max-width: 400px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);">
                <h3 style="font-size: 20px; font-weight: bold; margin-bottom: 20px;">${isEditing ? 'Edit Product' : 'Create New Product'}</h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <input type="text" id="p-name" placeholder="Product Name" value="${productData.name}" />
                    <input type="number" id="p-price" placeholder="Price" value="${productData.price}" />
                    <input type="text" id="p-category" placeholder="Category" value="${productData.category}" />
                    
                    <input type="text" id="p-image" placeholder="Emoji (e.g., 🎨) - acts as image upload" value="${productData.image}" />
                    
                    <input type="number" id="p-stock" placeholder="Stock" value="${productData.stock}" />
                    <textarea id="p-description" placeholder="Description" rows="3">${productData.description}</textarea>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="btn-primary" style="flex: 1; background-color: ${isEditing ? '#2196F3' : '#4CAF50'};" onclick="saveProduct()">
                        ${isEditing ? 'Update' : 'Create'}
                    </button>
                    <button class="btn-primary" style="flex: 1; background-color: #9E9E9E;" onclick="cancelEditingProduct()">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
}

function saveProduct() {
    const data = {
        name: document.getElementById('p-name').value,
        price: document.getElementById('p-price').value,
        category: document.getElementById('p-category').value,
        image: document.getElementById('p-image').value,
        stock: document.getElementById('p-stock').value,
        description: document.getElementById('p-description').value,
    };

    if (!data.name || !data.price || !data.category || !data.stock) {
        alert('Please fill all fields!');
        return;
    }

    if (editingProduct && editingProduct.id) {
        updateProduct({ ...data, id: editingProduct.id });
    } else {
        createProduct(data);
    }
    cancelEditingProduct();
}


// --- State Mutators and Main Renderer ---

function setCurrentPage(newPage) {
    currentPage = newPage;
    renderApp();
}

function setView(newView) {
    view = newView;
    renderApp();
}

function setEditingProduct(product) {
    editingProduct = product === null ? {} : product;
    renderApp();
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    setEditingProduct(product);
}

function cancelEditingProduct() {
    editingProduct = null;
    renderApp();
}

function renderApp() {
    renderHeader();
    const appContainer = document.getElementById('app-container');
    document.getElementById('modal-container').innerHTML = ''; 

    if (currentPage === 'landing') {
        renderLandingPage();
    } else if (currentPage === 'signup') {
        renderSignUpPage();
    } else if (currentPage === 'signin') {
        renderSignInPage();
    } else if (currentPage === 'app') {
        if (view === 'home') {
            renderHomeView();
        } else if (view === 'cart' && user.role === 'customer') {
            renderCartView();
        } else if (view === 'orders' && user.role === 'customer') {
            renderOrdersView();
        } else if (view === 'admin' && user.role === 'admin') {
            renderAdminView();
        } else if (view === 'all-orders' && user.role === 'admin') {
            renderAllOrdersView();
        } else {
            view = 'home';
            renderHomeView();
        }
    }

    if (editingProduct !== null) {
        renderProductFormModal();
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', renderApp);
