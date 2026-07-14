const API_BASE_URL = "http://localhost:3000";

const loadButton = document.querySelector("#load-items");
const deleteButton = document.querySelector("#delete-item");
const searchButton = document.querySelector("#search-by-id");
const restockButton = document.querySelector("#restockButton");
const itemList = document.querySelector("#items");
const form = document.querySelector("#post-put-patch-item-form");
const itemIdInput = document.querySelector("#item-id");
const itemNameInput = document.querySelector("#item-name");
const itemQuantityInput = document.querySelector("#item-quantity");
const itemRestockQuantityInput = document.querySelector("#item-restock_quantity");
const statusBox = document.querySelector("#status");

function setStatus(message) {
  statusBox.textContent = message;
}

function renderItems(items) {
  itemList.replaceChildren();

  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = `ID:${item.id} ||| Name:${item.name} ||| Quantity:${item.quantity} ||| Restock Quantity:${item.restock_quantity}`;
    itemList.appendChild(li);
  }
}

async function loadItems() {
  setStatus("Loading items...");

  try {
    const response = await fetch(`${API_BASE_URL}/api/items`);

    if (!response.ok) {
      throw new Error(`GET /api/items failed with status ${response.status}`);
    }

    const data = await response.json();
    renderItems(data.items);
    setStatus("Items loaded.");
  } catch (error) {
    setStatus(error.message);
  }
}

async function searchItems() {
  setStatus("Searching for item by ID...");
  const id = itemIdInput.value.trim();
  try {
    const response = await fetch(`${API_BASE_URL}/api/items/${id}`);

    if (!response.ok) {
      throw new Error(`GET /api/items failed with status ${response.status}`);
    }

    const data = await response.json();
    renderItems(data.items);
    setStatus("Items loaded.");
  } catch (error) {
    setStatus(error.message);
  }
}

async function restockItem() {
  const id = itemIdInput.value.trim();
  setStatus(`Restocking item of ID: ${id} by restock_quantity...`);
  try {
    const response = await fetch(`${API_BASE_URL}/api/items/${id}/restock`);

    if (!response.ok) {
      throw new Error(`GET /api/items/${id}/restock failed with status ${response.status}`);
    }

    const data = await response.json();
    renderItems(data.items);
    setStatus("Item restocked.");
  } catch (error) {
    setStatus(error.message);
  }
}

async function  deleteItem() {
  setStatus("Deleting item...");
  const id = itemIdInput.value.trim();
  try {
    const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
      method: "DELETE"});
    setStatus("Items deleted.");
  } catch (error) {
    setStatus(error.message);
  }
}

async function postItem(name, quantity, restock_quantity) {
  setStatus("Adding item...");
  try {
    const response = await fetch(`${API_BASE_URL}/api/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, quantity, restock_quantity})
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message ?? `POST /api/items failed with status ${response.status}`);
    }

    setStatus(`Added item: ${data.item.name}`);
  } catch (error) {
    setStatus(error.message);
  }
}

async function putItem(name, quantity, restock_quantity) {
  setStatus("Replacing item...");
  const id = itemIdInput.value.trim();
  try {
    const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, quantity, restock_quantity })
    });

    const data = await response;

    if (!response.ok) {
      throw new Error(data.message ?? `PUT /api/items/${id} failed with status ${response.status}`);
    }

    setStatus(`Replaced item with id: ${id}`);
  } catch (error) {
    setStatus(error.message);
  }
}

async function patchItem(name, quantity, restock_quantity) {
  setStatus("Replacing item...");
  const id = itemIdInput.value.trim();
  if( name != ""){
    try {
      const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name })
      });

    const data = await response;

    if (!response.ok) {
      throw new Error(data.message ?? `PUT /api/items/${id} failed with status ${response.status}`);
    }

    setStatus(`updated name of item with id: ${id}`);
    } catch (error) {
    setStatus(error.message);
    }
  } 
  if (quantity != "") {
    try {
      const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ quantity })
      });

    const data = await response;

    if (!response.ok) {
      throw new Error(data.message ?? `PUT /api/items/${id} failed with status ${response.status}`);
    }

    setStatus(`updated quantity of item with id: ${id}`);
    } catch (error) {
    setStatus(error.message);
    }
  }
  if (restock_quantity != "") {
    try {
      const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ restock_quantity })
      });

    const data = await response;

    if (!response.ok) {
      throw new Error(data.message ?? `PUT /api/items/${id} failed with status ${response.status}`);
    }

    setStatus(`updated quantity of item with id: ${id}`);
    } catch (error) {
    setStatus(error.message);
    }
  }
}


loadButton.addEventListener("click", loadItems);
deleteButton.addEventListener("click", deleteItem);
searchButton.addEventListener("click", searchItems);
restockButton.addEventListener("click", restockItem);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = itemNameInput.value.trim();
  const quantity = Number(itemQuantityInput.value);
  const restock_quantity = itemRestockQuantityInput.value;

  if (!Number.isInteger(quantity) || quantity < 0) {
    setStatus("Enter a non-negative integer quantity.");
    console.log("test");
    return;
  }

  if (itemIdInput.value == "" && itemNameInput.value != "" && itemQuantityInput.value != "-1" && Number.isInteger(quantity) && quantity >= 0) {
    console.log("using post function");
    postItem(name, quantity, restock_quantity);
  } else if ((Number.isInteger(itemIdInput.value) || itemIdInput.value >= 0) && itemNameInput.value != "" && itemQuantityInput.value != "" && itemRestockQuantityInput.value !== "") {
    console.log("using put function");
    putItem(name, quantity, restock_quantity);
  }else if ((itemIdInput.value === "" && Number.isInteger(itemIdInput.value) && itemIdInput.value >= 1) && ((itemNameInput.value === "" && itemQuantityInput.value !== "" && itemRestockQuantityInput.value !== "") || (itemNameInput.value !== "" && itemQuantityInput.value === "" && itemRestockQuantityInput.value !== "") || (itemNameInput.value === "" && itemQuantityInput.value !== "" && itemRestockQuantityInput.value === "") || (itemNameInput.value !== "" && itemQuantityInput.value === "" && itemRestockQuantityInput.value === "") || (itemNameInput.value === "" && itemQuantityInput.value === "" && itemRestockQuantityInput.value !== "") || (itemNameInput.value !== "" && itemQuantityInput.value !== "" && itemRestockQuantityInput.value === "") )) {
    console.log("using patch function");
    patchItem(name, quantity, restock_quantity);
  } else {
    console.log("Form not filled in correctly, no http methods called")
  }


  console.log(`ID: ${itemIdInput.value}`);
  console.log(`Name: ${itemNameInput.value}`);
  console.log(`Quantity: ${itemQuantityInput.value}`);
  console.log(`Restock Quantity: ${itemRestockQuantityInput.value}`);


  itemIdInput.value == "";
  itemNameInput.value = "";
  itemQuantityInput.value = "";
});
