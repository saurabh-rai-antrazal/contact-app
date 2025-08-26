// queries
export const GET_CONTACTS_QRY = `
  SELECT c.*, a.street_1, a.street_2, a.state, a.country 
  FROM contacts c 
  LEFT JOIN address a ON c.id = a.contact_id
`;

export const GET_CONTACT_BY_MOBILE_QRY = `
  SELECT c.*, a.street_1, a.street_2, a.state, a.country 
  FROM contacts c 
  LEFT JOIN address a ON c.id = a.contact_id 
  WHERE c.mobile_number = ?
`;

export const GET_CONTACT_ID_BY_MOBILE_QRY = `
  SELECT id FROM contacts WHERE mobile_number = ?
`;

// INSERT queries
export const ADD_NEW_CONTACT_DETAILS_QRY = `
  INSERT INTO contacts(first_name, last_name, mobile_number, email, image) 
  VALUES(?, ?, ?, ?, ?)
`;

export const ADD_ADDRESS_QRY = `
  INSERT INTO address(contact_id, street_1, street_2, state, country) 
  VALUES(?, ?, ?, ?, ?)
`;

// UPDATE queries
export const UPDATE_CONTACT_INFO_QRY = `
  UPDATE contacts 
  SET first_name = ?, last_name = ?, mobile_number = ?, email = ?, image = ? 
  WHERE mobile_number = ?
`;

export const UPDATE_ADDRESS_INFO_QRY = `
  UPDATE address 
  SET street_1 = ?, street_2 = ?, state = ?, country = ? 
  WHERE contact_id = ?
`;

// DELETE queries
export const DELETE_CONTACT_QRY = `
  DELETE FROM contacts WHERE mobile_number = ?
`;

export const DELETE_ADDRESS_QRY = `
  DELETE FROM address WHERE contact_id = ?
`;


// statements

export const FAILED_TO_FETCH_CONTACTS = "Failed to fetch contacts";
export const CONTACT_NOT_FOUND = "Contact not found";
export const FAILED_TO_FETCH_CONTACT_DETAILS = "Failed to fetch contact details";
export const FIRST_NAME_AND_MOBILE_REQUIRED = "First name and mobile number are required";
export const CONTACT_ALREADY_EXISTS = "Contact with this mobile number already exists";
export const CONTACT_ADDED_SUCCESSFULLY = "Contact added successfully";
export const FAILED_TO_ADD_CONTACT = "Failed to add contact";
export const CONTACT_UPDATED_SUCCESSFULLY = "Contact updated successfully";
export const FAILED_TO_UPDATE_CONTACT = "Failed to update contact";
export const CONTACT_DELETED_SUCCESSFULLY = "Contact deleted successfully";
export const FAILED_TO_DELETE_CONTACT = "Failed to delete contact";
