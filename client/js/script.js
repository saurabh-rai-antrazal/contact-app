// Global variables
let contacts = [];
let selectedContact = null;
let originalMobileNumber = null;
let selectedImageUrl = null;
let editMode = 'full';

// API URLs
const API_BASE = "http://localhost:4000/api";

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
  loadContacts();
  setupEventListeners();
});

// input formatter
function inputFormatter(ip){
  return ip.split(" ").filter((v) => v.trim()).join(" ");
}

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
      
        <div class="flex justify-space-between">
          <div class="address-line">${addressLine1 || "No address available"}</div>
          <button class="border-none bg-white" onclick="editContactPartial('${contact.mobile_number}', 'address1')">
            <img src="./assets/edit.png" alt="Edit Address 1" class="icon" />
          </button>
        </div>
        ${addressLine2 ? `
        <div class="flex justify-space-between">
          <div class="address-line">${addressLine2}</div>
          <button class="border-none bg-white" onclick="editContactPartial('${contact.mobile_number}', 'address2')">
            <img src="./assets/edit.png" alt="Edit Address 2" class="icon" />
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
  editMode = 'full';
  document.getElementById("modal-title").textContent = "Add Contact";
  document.getElementById("contact-form").reset();
  setDefaultImageForForm();
  enableAllFormFields();
  document.getElementById("contact-modal").style.display = "flex";
}

// Edit contact (full edit)
function editContact(mobileNumber) {
  const contact = contacts.find(c => c.mobileNumber === mobileNumber);
  if (!contact) return;

  originalMobileNumber = mobileNumber;
  editMode = 'full';
  document.getElementById("modal-title").textContent = "Edit Contact";
  
  populateForm(contact);
  enableAllFormFields();
  document.getElementById("contact-modal").style.display = "flex";
}

// Edit contact partially (address fields only)
function editContactPartial(mobileNumber, mode) {
  const contact = contacts.find(c => c.mobileNumber === mobileNumber);
  if (!contact) return;

  originalMobileNumber = mobileNumber;
  editMode = mode;
  
  if (mode === 'address1') {
    document.getElementById("modal-title").textContent = "Edit Address 1";
  } else if (mode === 'address2') {
    document.getElementById("modal-title").textContent = "Edit Address 2";
  }
  
  populateForm(contact);
  setFormFieldsForPartialEdit(mode);
  document.getElementById("contact-modal").style.display = "flex";
}

// Populate form with contact data
function populateForm(contact) {
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
}

// Enable all form fields
function enableAllFormFields() {
  const form = document.getElementById("contact-form");
  const inputs = form.querySelectorAll('input');
  const imageUploadSection = document.querySelector('.image-upload-section');
  
  inputs.forEach(input => {
    input.disabled = false;
    input.style.opacity = '1';
    input.style.cursor = 'text';
  });
  
  imageUploadSection.style.pointerEvents = 'auto';
  imageUploadSection.style.opacity = '1';
}

// Set form fields for partial editing
function setFormFieldsForPartialEdit(mode) {
  const form = document.getElementById("contact-form");
  const inputs = form.querySelectorAll('input');
  const imageUploadSection = document.querySelector('.image-upload-section');
  
  // Disable image upload for partial edits
  imageUploadSection.style.pointerEvents = 'none';
  imageUploadSection.style.opacity = '0.5';
  
  inputs.forEach(input => {
    const fieldName = input.name;
    let shouldEnable = false;
    
    if (mode === 'address1') {
      shouldEnable = (fieldName === 'Street_1' || fieldName === 'State');
    } else if (mode === 'address2') {
      shouldEnable = (fieldName === 'Street_2' || fieldName === 'country');
    }
    
    if (shouldEnable) {
      input.disabled = false;
      input.style.opacity = '1';
      input.style.cursor = 'text';
    } else {
      input.disabled = true;
      input.style.opacity = '0.5';
      input.style.cursor = 'not-allowed';
    }
  });
}

// Save contact (add or update)
async function saveContact(contactData) {
  try {
    let dataToSend;
    
    if (editMode === 'full' || !originalMobileNumber) {
      // Full save for new contacts or full edits
      dataToSend = {
        first_name: contactData.firstName,
        last_name: contactData.lastName,
        mobile_number: contactData.mobileNumber,
        email: contactData.email,
        street_1: contactData.street_1,
        street_2: contactData.street_2,
        state: contactData.state,
        country: contactData.country,
        image: contactData.image,
      };
    } else {
      // Partial save - only send changed fields
      const existingContact = contacts.find(c => c.mobileNumber === originalMobileNumber);
      dataToSend = {
        first_name: existingContact.firstName,
        last_name: existingContact.lastName,
        mobile_number: existingContact.mobileNumber,
        email: existingContact.email,
        street_1: existingContact.street_1,
        street_2: existingContact.street_2,
        state: existingContact.state,
        country: existingContact.country,
        image: existingContact.image,
      };
      
      if (editMode === 'address1') {
        dataToSend.street_1 = contactData.street_1;
        dataToSend.state = contactData.state;
      } else if (editMode === 'address2') {
        dataToSend.street_2 = contactData.street_2;
        dataToSend.country = contactData.country;
      }
    }

    const url = originalMobileNumber ? `${API_BASE}/contact/${originalMobileNumber}` : `${API_BASE}/contact`;
    const method = originalMobileNumber ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save contact");
    }

    await loadContacts();
    closeModal();
    
    // Clear contact details after editing
    selectedContact = null;
    document.getElementById("contact-details").innerHTML = '<div class="no-contact-selected"><p class="text-gray">Select a contact to view details</p></div>';
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
  editMode = 'full';
}

function setDefaultImageForForm() {
  selectedImageUrl = null;
  document.getElementById("image-preview").innerHTML = '<span id="preview-initials">+</span>';
  document.getElementById("image-input").value = "";
}

// Handle image upload
function handleImageUpload(file) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    alert("Only JPG, JPEG, and PNG images are allowed");
    document.getElementById("image-input").value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("Image size should be less than 5MB");
    document.getElementById("image-input").value = "";
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