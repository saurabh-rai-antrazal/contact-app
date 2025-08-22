export const GET_CONTACTS_QRY = `SELECT * FROM contacts`;
export const GET_CONTACT_BY_MOBILE_QRY = `SELECT * FROM contacts WHERE mobile_number = ?`;
export const ADD_NEW_CONTACT_QRY = `INSERT INTO contacts(first_name, last_name, mobile_number, email, address, street, state, country, image) VALUE(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
export const UPDATE_CONTACT_INFO_QRY = `UPDATE contacts SET first_name = ?, last_name = ?, mobile_number = ?, email = ?, address = ?, street = ?, state = ?, country = ?, image = ? WHERE mobile_number = ?`;
export const DELETE_CONTACT_QRY = `DELETE FROM contacts WHERE mobile_number = ?`;
