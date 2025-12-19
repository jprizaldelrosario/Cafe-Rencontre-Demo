const orders = [
    {
        id: "ORD-01-01-2025",
        status: "pending",
        customer: "John Doe",
        number: "0912345678",
        date: "01/01/2025",
        mop: "Online",
        total: "₱79.00",
        items: 3
    },
    {
        id: "ORD-01-02-2025",
        status: "rejected",
        customer: "John Doe",
        number: "0912345678",
        date: "01/02/2025",
        mop: "Cash",
        total: "₱79.00",
        items: 1
    },
    {
        id: "ORD-01-03-2025",
        status: "completed",
        customer: "Jane Smit  1h",
        number: "0912345678",
        date: "01/03/2025",
        mop: "Online",
        total: "₱109.00",
        items: 2
    },
    {
        id: "ORD-01-01-2025",
        status: "approved",
        customer: "Bob Wilson",
        number: "0912345678",
        date: "01/01/2025",
        mop: "Cash",
        total: "₱59.00",
        items: 1
    }
];

let currentFilter = "all";

function getStatusClass(status) {
    return `status-${status}`;
}

function getStatusText(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function renderOrders() {
    const container = document.getElementById("ordersList");
    container.innerHTML = "";

    let filteredOrders = currentFilter === "all" 
        ? orders 
        : orders.filter(order => order.status === currentFilter);

    // Apply search filter
    if (currentSearchTerm) {
        filteredOrders = filteredOrders.filter(order => 
            order.orderNumber?.toLowerCase().includes(currentSearchTerm) ||
            order.customer?.toLowerCase().includes(currentSearchTerm) ||
            order.email?.toLowerCase().includes(currentSearchTerm) ||
            order.phone?.toLowerCase().includes(currentSearchTerm)
        );
    }

    if (filteredOrders.length === 0) {
        container.innerHTML = `
            <div class="no-orders" style="text-align: center; padding: 40px; color: #666;">
                <p>No orders found${currentSearchTerm ? ` for "${currentSearchTerm}"` : ''}.</p>
            </div>
        `;
        return;
    }

    filteredOrders.forEach(order => {
        const orderCard = document.createElement("div");
        orderCard.className = "order-card";
        orderCard.innerHTML = `
            <div class="order-header">
                <span class="order-id">${order.orderNumber}</span>
                <span class="status-badge ${getStatusClass(order.status)}">
                    ${getStatusText(order.status)}
                </span>
            </div>
            <div class="order-details">
                <div class="detail-item">
                    <span class="detail-label">Customer:</span>
                    <span class="detail-value">${escapeHtml(order.customer)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${escapeHtml(order.phone || 'N/A')}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Total:</span>
                    <span class="detail-value">${order.total}</span>
                </div>
            </div>
            <div class="order-details">
                <div class="detail-item">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${order.date}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">MOP:</span>
                    <span class="detail-value">${order.mop}</span>
                </div>
                <div class="detail-item"></div>
            </div>
            <div class="order-footer">
                <span class="item-count">${order.items} item(s)</span>
                <button class="view-details-btn" onclick="viewDetails('${order.id}')">
                
                     <span> <img src="/Background-Image/eye.png"></span>
                     <p>View Details</p>
                </button>
            </div>
        `;
        container.appendChild(orderCard);
    });
}


function viewDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('modalCustomer').textContent = order.customer;
    document.getElementById('modalEmail').textContent = order.email;
    document.getElementById('modalDate').textContent = order.date;
    
    const statusEl = document.getElementById('modalStatus');
    statusEl.textContent = order.status.toUpperCase();

    statusEl.className = 'value status-text';


    const tbody = document.getElementById('modalItemsList');
    tbody.innerHTML = ''; 

    order.details.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-right">${item.price}</td>
            <td class="text-right">${item.subtotal}</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('modalTotal').textContent = order.total;

    const modal = document.getElementById('orderModal');
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('orderModal');
    modal.style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('orderModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll(".filter-tab").forEach(tab => {
        tab.addEventListener("click", function() {
            document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
            this.classList.add("active");
            currentFilter = this.dataset.status;
            renderOrders();
        });
    });


    document.getElementById("searchBox").addEventListener("input", function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const orderCards = document.querySelectorAll(".order-card");
        
        orderCards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(searchTerm) ? "block" : "none";
        });
    });


    renderOrders();
});

function viewDetails(orderId) {
    alert(`View details for ${orderId}`);

}