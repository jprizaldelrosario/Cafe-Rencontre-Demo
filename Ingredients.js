// const API_BASE_URL = 'http://localhost:8001/backend/api';

let editingIngredient = null;
let deletingIngredient = null;

document.getElementById("add-button").onclick = () => {
  editingIngredient = null;
  clearFields();
  document.querySelector(".popup-content h2").textContent = "Add Ingredients";
  document.getElementById("confirmPopup").textContent = "Confirm";
  document.getElementById("popup").style.display = "flex";
};


document.getElementById("closePopup").onclick = closePopup;
document.getElementById("cancelPopup").onclick = closePopup;

function closePopup() {
  document.getElementById("popup").style.display = "none";
}


document.getElementById("closeDeletePopup").onclick = closeDeletePopup;
document.getElementById("cancelDelete").onclick = closeDeletePopup;

function closeDeletePopup() {
  document.getElementById("deletePopup").style.display = "none";
  deletingIngredient = null;
}

function clearFields() {
  document.getElementById("ingname").value = "";
  document.getElementById("unit").value = "";
  document.getElementById("pack").value = "";
  document.getElementById("quantity").value = "";
}

document.getElementById("confirmPopup").onclick = () => {
  const name = document.getElementById("ingname").value;
  const unit = document.getElementById("unit").value;
  const pack = document.getElementById("pack").value;
  const quantity = document.getElementById("quantity").value;

  if (!name || !unit || !pack || !quantity) {
      alert("Please fill all fields");
      return;
  }

  if (editingIngredient) {
      editingIngredient.querySelector(".ingredient-name").textContent = name;
      editingIngredient.querySelector(".bottles-count").textContent = pack;
      editingIngredient.querySelector(".available-quantity").textContent = quantity;
      editingIngredient.querySelector(".available-unit").textContent = unit;
    
      const percentage = calculatePercentage(pack, quantity);
      editingIngredient.querySelector(".progress-fill").style.width = percentage + "%";
      editingIngredient.querySelector(".percentage-text").textContent = Math.round(percentage) + "%";
      
      editingIngredient = null;
      closePopup();
      return;
  }
  addIngredient(name, unit, pack, quantity);
  closePopup();
};

document.getElementById("confirmDelete").onclick = () => {
  if (deletingIngredient) {
    deletingIngredient.remove();
    closeDeletePopup();
  }
};

function calculatePercentage(bottles, available) {
    if (bottles <= 0) return 0;
    const percentage = Math.max(0, Math.min(100, 100 - (available / bottles) * 100));
    return Math.round(percentage);
}

function addIngredientToDOM(ingredient) {
    const container = document.getElementById("IngredientsList");
    const ingredientElement = document.createElement("div");
    ingredientElement.className = "ingredient-item";
    ingredientElement.dataset.id = ingredient.id;
    
    const percentage = ingredient.percentage || calculatePercentage(
        ingredient.bottles_count, 
        ingredient.available_quantity
    );
    
    let progressColor = '#532C04'; // default (low usage)
    if (percentage >= 80) progressColor = '#ff6b6b'; // red for high usage (low stock)
    else if (percentage >= 50) progressColor = '#ffa726'; // orange for medium usage
    
    ingredientElement.innerHTML = `
        <div class="ingredient-header">
            <h3 class="ingredient-name">${escapeHtml(ingredient.name)}</h3>
            <div class="ingredient-actions">
                <button class="edit-btn-ing">
                    <img src="/Background-Image/edit icon.png" alt="Edit">
                </button>
                <button class="delete-btn-ing">
                    <img src="/Background-Image/trash icon.png" alt="Delete">
                </button>
            </div>
        </div>
        
        <div class="ingredient-info">
            <div class="bottles-info">
                <span class="label">Bottles:</span>
                <span class="bottles-count">${ingredient.bottles_count}</span>
            </div>
            <div class="available-info">
                <span class="label">Available:</span>
                <span class="available-quantity">${Math.round(ingredient.available_quantity)}</span>
                <span class="available-unit">${escapeHtml(ingredient.unit)}</span>
            </div>
        </div>
        
        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%; background-color: ${progressColor};"></div>
            </div>
            <span class="percentage-text">${percentage}%</span>
        </div>
    `;
    
    const editBtn = ingredientElement.querySelector(".edit-btn-ing");
    const deleteBtn = ingredientElement.querySelector(".delete-btn-ing");
    
    if (editBtn) {
        editBtn.onclick = () => openEdit(ingredientElement);
    }
    
    if (deleteBtn) {
        deleteBtn.onclick = () => openDeleteConfirmation(ingredientElement);
    }
    
    container.appendChild(ingredientElement);
}

async function saveIngredient(ingredientData, isEditing = false) {
    try {
        const url = `${API_BASE_URL}/ingredients.php`;
        const method = isEditing ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ingredientData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('Error saving ingredient:', error);
        return {
            success: false,
            message: 'Network error: ' + error.message
        };
    }
}

document.getElementById("confirmPopup").onclick = async () => {
    const name = document.getElementById("ingname").value.trim();
    const unit = document.getElementById("unit").value.trim();
    const pack = document.getElementById("pack").value.trim();
    const quantity = document.getElementById("quantity").value.trim();
    
    if (!name || !unit || !pack || !quantity) {
        alert("Please fill all fields");
        return;
    }
    
    if (isNaN(pack) || parseInt(pack) < 0) {
        alert("Please enter a valid bottle count");
        return;
    }
    
    if (isNaN(quantity) || parseFloat(quantity) < 0) {
        alert("Please enter a valid quantity");
        return;
    }
    
    const ingredientData = {
        name: name,
        unit: unit,
        bottles_count: parseInt(pack),
        available_quantity: parseFloat(quantity)
    };
    
    if (editingIngredient) {
        const ingredientId = editingIngredient.dataset.id;
        if (!ingredientId) {
            alert("Error: Ingredient ID not found");
            return;
        }
        ingredientData.id = parseInt(ingredientId);
    }
    
    const confirmBtn = document.getElementById("confirmPopup");
    const originalText = confirmBtn.textContent;
    confirmBtn.textContent = "Saving...";
    confirmBtn.disabled = true;
    
    try {
        const result = await saveIngredient(ingredientData, editingIngredient !== null);
        
        if (result.success) {
            await loadIngredients();
            closePopup();
            // Update the notification badge
            if (typeof updateIngredientBadge === 'function') {
                updateIngredientBadge();
            }
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        alert("Error saving ingredient: " + error.message);
    } finally {
        confirmBtn.textContent = originalText;
        confirmBtn.disabled = false;
    }
};

function openEdit(ingredientElement) {
    editingIngredient = ingredientElement;
    
    document.querySelector(".popup-content h2").textContent = "Edit Ingredients";
    document.getElementById("confirmPopup").textContent = "Save";
    
    const name = ingredientElement.querySelector(".ingredient-name").textContent;
    const bottles = ingredientElement.querySelector(".bottles-count").textContent;
    const quantity = ingredientElement.querySelector(".available-quantity").textContent;
    const unit = ingredientElement.querySelector(".available-unit").textContent;
    
    document.getElementById("ingname").value = name;
    document.getElementById("unit").value = unit;
    document.getElementById("pack").value = bottles;
    document.getElementById("quantity").value = quantity;
    
    document.getElementById("popup").style.display = "flex";
}

async function deleteIngredient(ingredientId) {
    try {
        const response = await fetch(`${API_BASE_URL}/ingredients.php?id=${ingredientId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('Error deleting ingredient:', error);
        return {
            success: false,
            message: 'Network error: ' + error.message
        };
    }
}

function openDeleteConfirmation(ingredientElement) {
    deletingIngredient = ingredientElement;
    document.getElementById("deletePopup").style.display = "flex";
}

document.getElementById("confirmDelete").onclick = async () => {
    if (!deletingIngredient) return;
    
    const ingredientId = deletingIngredient.dataset.id;
    if (!ingredientId) {
        alert("Error: Ingredient ID not found");
        closeDeletePopup();
        return;
    }
    
    const deleteBtn = document.getElementById("confirmDelete");
    const originalText = deleteBtn.textContent;
    deleteBtn.textContent = "Deleting...";
    deleteBtn.disabled = true;
    
    try {
        const result = await deleteIngredient(ingredientId);
        
        if (result.success) {
            deletingIngredient.remove();
            showMessage('Ingredient deleted successfully');
            // Update the notification badge
            if (typeof updateIngredientBadge === 'function') {
                updateIngredientBadge();
            }
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        alert("Error deleting ingredient: " + error.message);
    } finally {
        deleteBtn.textContent = originalText;
        deleteBtn.disabled = false;
        closeDeletePopup();
    }
};

function closePopup() {
    document.getElementById("popup").style.display = "none";
    editingIngredient = null;
    clearFields();
}

function closeDeletePopup() {
    document.getElementById("deletePopup").style.display = "none";
    deletingIngredient = null;
}

function clearFields() {
    document.getElementById("ingname").value = "";
    document.getElementById("unit").value = "";
    document.getElementById("pack").value = "";
    document.getElementById("quantity").value = "";
}

function filterIngredients(searchTerm) {
    const ingredientItems = document.querySelectorAll(".ingredient-item");
    
    ingredientItems.forEach(item => {
        const ingredientName = item.querySelector(".ingredient-name").textContent.toLowerCase();
        const matches = ingredientName.includes(searchTerm);
        item.style.display = matches ? "block" : "none";
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading(show) {
    const container = document.getElementById("IngredientsList");
    if (!container) return;
    
    if (show) {
        container.innerHTML = `
            <div class="loading">
                <p>Loading ingredients...</p>
            </div>
        `;
    }
}

function showError(message) {
    const container = document.getElementById("IngredientsList");
    if (!container) return;
    
    container.innerHTML = `
        <div class="error">
            <p style="color: red;">${message}</p>
            <button onclick="loadIngredients()">Retry</button>
        </div>
    `;
}

function showMessage(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}