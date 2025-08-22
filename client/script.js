// Global variables
let contacts = [];
let filteredContacts = [];
let selectedContact = null;
let originalMobileNumber = null;
let selectedImageUrl = null;

// API configuration
const API_BASE_URL = "http://localhost:4000/api/contacts";
const API_CONTACT_URL = "http://localhost:4000/api/contact";

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  loadContacts();
  setupEventListeners();
});

// Load contacts from API
async function loadContacts() {
  try {
    const contactList = document.getElementById("contact-list");
    contactList.innerHTML = '<div class="loading">Loading contacts...</div>';

    const response = await fetch(API_BASE_URL);
    const data = await response.json();

    // Transform API data to match our contact structure
    contacts = data.map((contact) => ({
      id: contact.id,
      firstName: contact.first_name,
      lastName: contact.last_name || "",
      mobileNumber: contact.mobile_number,
      email: contact.email || "",
      address: contact.address || "",
      street: contact.street || "",
      country: contact.country || "",
      state: contact.state || "",
      image: contact.image || "",
    }));

    filteredContacts = [...contacts];
    renderContacts();
  } catch (error) {
    console.error("Error loading contacts:", error);
    document.getElementById("contact-list").innerHTML =
      '<div class="error">Failed to load contacts. Please check your API endpoint and try again.</div>';
  }
}

// Add new contact to API
async function addContactToAPI(contactData) {
  try {
    const response = await fetch(API_CONTACT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: contactData.firstName,
        last_name: contactData.lastName,
        mobile_number: contactData.mobileNumber,
        email: contactData.email,
        address: contactData.address,
        street: contactData.street,
        country: contactData.country,
        state: contactData.state,
        image: contactData.image,
      }),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      } else {
        const errorText = await response.text();
        throw new Error(
          `Server error (${response.status}). Please check the server logs.`
        );
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding contact:", error);
    throw error;
  }
}

// Update existing contact via API
async function updateContactInAPI(originalMobile, contactData) {
  try {
    const response = await fetch(`${API_CONTACT_URL}/${originalMobile}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: contactData.firstName,
        last_name: contactData.lastName,
        mobile_number: contactData.mobileNumber,
        email: contactData.email,
        address: contactData.address,
        street: contactData.street,
        country: contactData.country,
        state: contactData.state,
        image: contactData.image,
      }),
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      } else {
        const errorText = await response.text();
        throw new Error(
          `Server error (${response.status}). Please check the server logs.`
        );
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating contact:", error);
    throw error;
  }
}

// Delete contact via API
async function deleteContactFromAPI(mobileNumber) {
  try {
    const response = await fetch(`${API_CONTACT_URL}/${mobileNumber}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
}

// Render contacts in the list
function renderContacts() {
  const contactList = document.getElementById("contact-list");

  if (filteredContacts.length === 0) {
    contactList.innerHTML = '<div class="empty-state">No contacts found</div>';
    return;
  }

  const contactsHTML = filteredContacts
    .map((contact) => {
      const fullName = `${contact.firstName} ${contact.lastName}`.trim();
      return `
        <div class="contact-item" onclick="selectContact('${contact.mobileNumber}')">
          <div class="contact-info">
            <h2 class="font-md font-weight-md">${fullName}</h2>
            <p class="font-sm text-gray">${contact.mobileNumber}</p>
          </div>
          <div class="contact-actions" onclick="event.stopPropagation()">
          <img src="./assets/edit.png" alt="Edit" class="icon pointer" onclick="editSelectedContact()" />
            <img src="./assets/waste.svg" alt="Delete" class="icon pointer" onclick="deleteContact('${contact.mobileNumber}')" />
          </div>
        </div>
      `;
    })
    .join("");

  contactList.innerHTML = contactsHTML;
}

// Filter contacts based on search
function filterContacts(searchTerm) {
  if (!searchTerm.trim()) {
    filteredContacts = [...contacts];
  } else {
    const term = searchTerm.toLowerCase();
    filteredContacts = contacts.filter(
      (contact) =>
        contact.firstName.toLowerCase().includes(term) ||
        contact.lastName.toLowerCase().includes(term) ||
        contact.mobileNumber.includes(term)
    );
  }
  renderContacts();
}

// Select and load detailed contact information
async function selectContact(mobileNumber) {
  try {
    const contactDetails = document.getElementById("contact-details");
    contactDetails.innerHTML =
      '<div class="loading-details">Loading contact details...</div>';

    const response = await fetch(`${API_CONTACT_URL}/${mobileNumber}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contactData = await response.json();
    selectedContact = contactData;
    renderContactDetails(contactData);
  } catch (error) {
    console.error("Error loading contact details:", error);
    document.getElementById("contact-details").innerHTML =
      '<div class="no-contact-selected"><p class="text-gray">Select a contact to view details</p></div>';
  }
}

// Render detailed contact information
function renderContactDetails(contact) {
  const fullName = `${contact.first_name} ${contact.last_name || ""}`.trim();
  const initials = `${contact.first_name.charAt(0)}${
    contact.last_name ? contact.last_name.charAt(0) : ""
  }`.toUpperCase();

  // Format address in one line
  const addressParts = [
    contact.address,
    contact.street,
    contact.state,
    contact.country,
  ].filter((part) => part && part.trim() !== "");

  const addressLine =
    addressParts.length > 0 ? addressParts.join(", ") : "No address available";

  const detailsHTML = `
    <div class="contact-detail-card">
      <div class="contact-profile-image">
        ${
          contact.image
            ? `<img src="${contact.image}" alt="${fullName}">`
            : initials
        }
      </div>
      
      <div class="contact-name">${fullName}</div>
      <div class="contact-email">${contact.email || "No email available"}</div>
      <div class="contact-phone">${contact.mobile_number}</div>
      
      <div class="contact-address-section">
        <div class="address-line ${addressParts.length === 0 ? "empty" : ""}">
          ${addressLine}
        </div>
      </div>

      <button class="edit-contact-btn" onclick="editSelectedContact()">
        <img src="./assets/icons8-edit-48.png"/>
      </button>
    </div>
  `;

  document.getElementById("contact-details").innerHTML = detailsHTML;
}

// Edit the currently selected contact
function editSelectedContact() {
  if (!selectedContact) return;

  originalMobileNumber = selectedContact.mobile_number;
  document.getElementById("modal-title").textContent = "Edit Contact";

  const form = document.getElementById("contact-form");
  form.firstName.value = selectedContact.first_name;
  form.lastName.value = selectedContact.last_name || "";
  form.mobileNumber.value = selectedContact.mobile_number;
  form.email.value = selectedContact.email || "";
  form.address.value = selectedContact.address || "";
  form.street.value = selectedContact.street || "";
  form.country.value = selectedContact.country || "";
  form.state.value = selectedContact.state || "";

  // Set image preview if contact has image
  if (selectedContact.image) {
    selectedImageUrl = selectedContact.image;
    document.getElementById(
      "image-preview"
    ).innerHTML = `<img src="${selectedContact.image}" alt="Preview">`;
  } else {
    clearImagePreview();
  }

  document.getElementById("contact-modal").style.display = "flex";
}

// Convert file to Base64
function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Handle image upload
function handleImageUpload() {
  const imageInput = document.getElementById("image-input");

  imageInput.addEventListener("change", async function (e) {
    const file = e.target.files[0];
    if (file) {
      try {
        // Check file size (limit to 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          alert(
            "Image size should be less than 5MB. Please choose a smaller image."
          );
          e.target.value = "";
          return;
        }

        selectedImageUrl = await convertToBase64(file);
        document.getElementById(
          "image-preview"
        ).innerHTML = `<img src="${selectedImageUrl}" alt="Preview">`;
      } catch (error) {
        console.error("Error converting image to base64:", error);
        alert("Failed to process image. Please try again.");
        e.target.value = "";
      }
    }
  });
}

// Clear image preview
function clearImagePreview() {
  selectedImageUrl = null;
  document.getElementById("image-preview").innerHTML =
    '<span id="preview-initials">+</span>';
  document.getElementById("image-input").value = "";
}

// Modal functions
function showAddModal() {
  originalMobileNumber = null;
  document.getElementById("modal-title").textContent = "Add Contact";
  document.getElementById("contact-form").reset();
  clearImagePreview();
  document.getElementById("contact-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("contact-modal").style.display = "none";
  clearImagePreview();
  originalMobileNumber = null;
}

// Delete contact
async function deleteContact(mobileNumber) {
  if (!confirm("Are you sure you want to delete this contact?")) return;

  try {
    await deleteContactFromAPI(mobileNumber);
    await loadContacts();

    // Clear contact details if the deleted contact was currently selected
    if (selectedContact && selectedContact.mobile_number === mobileNumber) {
      selectedContact = null;
      document.getElementById("contact-details").innerHTML =
        '<div class="no-contact-selected"><p class="text-gray">Select a contact to view details</p></div>';
    }
  } catch (error) {
    console.error("Error deleting contact:", error);
    alert(`Failed to delete contact: ${error.message}`);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Add contact button
  document
    .getElementById("add-contact")
    .addEventListener("click", showAddModal);

  // Search functionality
  document
    .getElementById("search-input")
    .addEventListener("input", function (e) {
      filterContacts(e.target.value);
    });

  // Form submission
  document
    .getElementById("contact-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData(e.target);
      const contactData = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName") || "",
        mobileNumber: formData.get("mobileNumber"),
        email: formData.get("email") || "",
        address: formData.get("address") || "",
        street: formData.get("street") || "",
        country: formData.get("country") || "",
        state: formData.get("state") || "",
        image: selectedImageUrl || "",
      };

      try {
        if (originalMobileNumber) {
          // Update existing contact
          await updateContactInAPI(originalMobileNumber, contactData);
          await loadContacts();

          // Re-select contact with updated mobile number
          const updatedMobileNumber = contactData.mobileNumber;
          setTimeout(() => selectContact(updatedMobileNumber), 100);
        } else {
          // Add new contact
          await addContactToAPI(contactData);
          await loadContacts();
        }

        closeModal();
      } catch (error) {
        console.error("Error saving contact:", error);
        alert(`Failed to save contact: ${error.message}`);
      }
    });

  // Initialize image upload functionality
  handleImageUpload();

  // Modal close buttons
  document
    .getElementById("modal-cancel-btn")
    .addEventListener("click", closeModal);

  // Close modal when clicking on overlay
  document
    .getElementById("contact-modal")
    .addEventListener("click", function (e) {
      if (e.target === this) {
        closeModal();
      }
    });

  // Close modal with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeModal();
    }
  });
}
