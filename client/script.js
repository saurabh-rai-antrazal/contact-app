// Global variables
let contacts = [];
let selectedContact = null;
let originalMobileNumber = null;
let selectedImageUrl = null;

// API URLs
const API_BASE = "http://localhost:4000/api";

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
  loadContacts();
  setupEventListeners();
});

// Load all contacts
async function loadContacts() {
  try {
    document.getElementById("contact-list").innerHTML = '<div class="loading">Loading contacts...</div>';
    
    const response = await fetch(`${API_BASE}/contacts`);
    const data = await response.json();

    contacts = data.map(contact => ({
      id: contact.id,
      firstName: contact.first_name,
      lastName: contact.last_name || "",
      mobileNumber: contact.mobile_number,
      email: contact.email || "",
      street_1: contact.street_1 || "",
      street_2: contact.street_2 || "",
      state: contact.state || "",
      country: contact.country || "",
      image: contact.image || "",
    }));

    renderContacts(contacts);
  } catch (error) {
    console.error("Error loading contacts:", error);
    document.getElementById("contact-list").innerHTML = '<div class="error">Failed to load contacts</div>';
  }
}

// Render contact list
function renderContacts(contactsToRender) {
  const contactList = document.getElementById("contact-list");

  if (contactsToRender.length === 0) {
    contactList.innerHTML = '<div class="empty-state">No contacts found</div>';
    return;
  }

  const html = contactsToRender.map(contact => {
    const fullName = `${contact.firstName} ${contact.lastName}`.trim();
    return `
      <div class="contact-item" onclick="selectContact('${contact.mobileNumber}')">
        <div class="contact-info">
          <h2 class="font-md font-weight-md">${fullName}</h2>
          <p class="font-sm text-gray">${contact.mobileNumber}</p>
        </div>
        <div class="contact-actions" onclick="event.stopPropagation()">
          <img src="./assets/edit.png" alt="Edit" class="icon pointer" onclick="editContact('${contact.mobileNumber}')" />
          <img src="./assets/waste.svg" alt="Delete" class="icon pointer" onclick="deleteContact('${contact.mobileNumber}')" />
        </div>
      </div>
    `;
  }).join("");

  contactList.innerHTML = html;
}

// Search contacts
function searchContacts(searchTerm) {
  const term = searchTerm.toLowerCase();
  const filtered = contacts.filter(contact =>
    contact.firstName.toLowerCase().includes(term) ||
    contact.lastName.toLowerCase().includes(term) ||
    contact.mobileNumber.includes(term)
  );
  renderContacts(filtered);
}

// Select and show contact details
async function selectContact(mobileNumber) {
  try {
    document.getElementById("contact-details").innerHTML = '<div class="loading-details">Loading...</div>';

    const response = await fetch(`${API_BASE}/contact/${mobileNumber}`);
    const contact = await response.json();
    
    selectedContact = contact;
    showContactDetails(contact);
  } catch (error) {
    console.error("Error loading contact details:", error);
    document.getElementById("contact-details").innerHTML = '<div class="no-contact-selected"><p class="text-gray">Select a contact to view details</p></div>';
  }
}

// Show contact details
function showContactDetails(contact) {
  const fullName = `${contact.first_name} ${contact.last_name || ""}`.trim();
  
  const addressLine1 = [contact.street_1, contact.state].filter(part => part && part.trim() !== "").join(", ");
  const addressLine2 = [contact.street_2, contact.country].filter(part => part && part.trim() !== "").join(", ");

  const html = `
    <div class="contact-detail-card">
      <div class="contact-profile-image">
        <img src="${contact.image || './assets/dummy.jpg'}" alt="${fullName}" />
      </div>
      
      <div class="contact-name">${fullName}</div>
      <div class="contact-email">${contact.email || "No email available"}</div>
      <div class="contact-phone">${contact.mobile_number}</div>
      
      <div class="contact-address-section">
        <div class="address-line-container">
          <div class="address-line">${addressLine1 || "No address available"}</div>
          <button class="edit-btn" onclick="editContact('${contact.mobile_number}')">
            <img src="./assets/edit.png" alt="Edit" class="icon" />
          </button>
        </div>
        ${addressLine2 ? `
        <div class="address-line-container">
          <div class="address-line">${addressLine2}</div>
          <button class="edit-btn" onclick="editContact('${contact.mobile_number}')">
            <img src="./assets/edit.png" alt="Edit" class="icon" />
          </button>
        </div>
        ` : ''}
      </div>
    </div>
  `;

  document.getElementById("contact-details").innerHTML = html;
}

// Show add modal
function showAddModal() {
  originalMobileNumber = null;
  document.getElementById("modal-title").textContent = "Add Contact";
  document.getElementById("contact-form").reset();
  setDefaultImageForForm();
  document.getElementById("contact-modal").style.display = "flex";
}

// Edit contact
function editContact(mobileNumber) {
  const contact = contacts.find(c => c.mobileNumber === mobileNumber);
  if (!contact) return;

  originalMobileNumber = mobileNumber;
  document.getElementById("modal-title").textContent = "Edit Contact";
  
  const form = document.getElementById("contact-form");
  form.firstName.value = contact.firstName;
  form.lastName.value = contact.lastName;
  form.mobileNumber.value = contact.mobileNumber;
  form.email.value = contact.email;
  form.Street_1.value = contact.street_1;
  form.Street_2.value = contact.street_2;
  form.State.value = contact.state;
  form.country.value = contact.country;

  if (contact.image) {
    selectedImageUrl = contact.image;
    document.getElementById("image-preview").innerHTML = `<img src="${contact.image}" alt="Preview">`;
  } else {
    setDefaultImageForForm();
  }

  document.getElementById("contact-modal").style.display = "flex";
}

// Save contact (add or update)
async function saveContact(contactData) {
  try {
    const url = originalMobileNumber ? `${API_BASE}/contact/${originalMobileNumber}` : `${API_BASE}/contact`;
    const method = originalMobileNumber ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: contactData.firstName,
        last_name: contactData.lastName,
        mobile_number: contactData.mobileNumber,
        email: contactData.email,
        street_1: contactData.street_1,
        street_2: contactData.street_2,
        state: contactData.state,
        country: contactData.country,
        image: contactData.image,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save contact");
    }

    await loadContacts();
    closeModal();

    if (originalMobileNumber && contactData.mobileNumber !== originalMobileNumber) {
      setTimeout(() => selectContact(contactData.mobileNumber), 100);
    }
  } catch (error) {
    console.error("Error saving contact:", error);
    alert(`Failed to save contact: ${error.message}`);
  }
}

// Delete contact
async function deleteContact(mobileNumber) {
  if (!confirm("Are you sure you want to delete this contact?")) return;

  try {
    const response = await fetch(`${API_BASE}/contact/${mobileNumber}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete contact");
    }

    await loadContacts();

    if (selectedContact && selectedContact.mobile_number === mobileNumber) {
      selectedContact = null;
      document.getElementById("contact-details").innerHTML = '<div class="no-contact-selected"><p class="text-gray">Select a contact to view details</p></div>';
    }
  } catch (error) {
    console.error("Error deleting contact:", error);
    alert(`Failed to delete contact: ${error.message}`);
  }
}

// Close modal
function closeModal() {
  document.getElementById("contact-modal").style.display = "none";
  setDefaultImageForForm();
  originalMobileNumber = null;
}

// Set default image for form (only shows + placeholder)
function setDefaultImageForForm() {
  selectedImageUrl = null;
  document.getElementById("image-preview").innerHTML = '<span id="preview-initials">+</span>';
  document.getElementById("image-input").value = "";
}

// Handle image upload
function handleImageUpload(file) {
  if (file.size > 5 * 1024 * 1024) {
    alert("Image size should be less than 5MB");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    selectedImageUrl = e.target.result;
    document.getElementById("image-preview").innerHTML = `<img src="${selectedImageUrl}" alt="Preview">`;
  };
  reader.readAsDataURL(file);
}

// Setup event listeners
function setupEventListeners() {
  // Add contact button
  document.getElementById("add-contact").addEventListener("click", showAddModal);

  // Search input
  document.getElementById("search-input").addEventListener("input", function(e) {
    searchContacts(e.target.value);
  });

  // Form submission
  document.getElementById("contact-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const contactData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName") || "",
      mobileNumber: formData.get("mobileNumber"),
      email: formData.get("email") || "",
      street_1: formData.get("Street_1") || "",
      street_2: formData.get("Street_2") || "",
      state: formData.get("State") || "",
      country: formData.get("country") || "",
      image: selectedImageUrl || "",
    };

    saveContact(contactData);
  });

  // Image upload
  document.getElementById("image-input").addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) handleImageUpload(file);
  });

  // Modal close buttons
  document.getElementById("modal-cancel-btn").addEventListener("click", closeModal);
  
  // Close modal on overlay click
  document.getElementById("contact-modal").addEventListener("click", function(e) {
    if (e.target === this) closeModal();
  });

  // Close modal with Escape key
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") closeModal();
  });
}