// contactRepo.js
import { getConnection } from "../utils/database.js";
import {
  GET_CONTACTS_QRY,
  GET_CONTACT_BY_MOBILE_QRY,
  ADD_NEW_CONTACT_DETAILS_QRY,
  ADD_ADDRESS_QRY,
  UPDATE_CONTACT_INFO_QRY,
  UPDATE_ADDRESS_INFO_QRY,
  DELETE_CONTACT_QRY,
  DELETE_ADDRESS_QRY,
  GET_CONTACT_ID_BY_MOBILE_QRY,
} from "../utils/const.js";

const contactList = async () => {
  const connection = getConnection();
  const [result] = await connection.query(GET_CONTACTS_QRY);
  return result;
};

const contactDetails = async (mobile) => {
  const connection = getConnection();
  const [result] = await connection.query(GET_CONTACT_BY_MOBILE_QRY, [mobile]);
  return result;
};

const addContact = async (
  first_name,
  last_name,
  mobile_number,
  email,
  street_1,
  street_2,
  state,
  country,
  image
) => {
  const connection = getConnection();

  try {
    // Add contact first
    const [contactResult] = await connection.query(
      ADD_NEW_CONTACT_DETAILS_QRY,
      [first_name, last_name, mobile_number, email, image]
    );

    // Get the new contact ID and add address
    const contactId = contactResult.insertId;

    await connection.query(ADD_ADDRESS_QRY, [
      contactId,
      street_1,
      street_2,
      state,
      country,
    ]);

    return contactResult;
  } catch (error) {
  }
};

const updateContact = async (
  first_name,
  last_name,
  mobile_number,
  email,
  street_1,
  street_2,
  state,
  country,
  image,
  original_mobile
) => {
  const connection = getConnection();

  // Update contact info
  const [contactResult] = await connection.query(UPDATE_CONTACT_INFO_QRY, [
    first_name,
    last_name,
    mobile_number,
    email,
    image,
    original_mobile,
  ]);

  // Get contact ID and update address
  const [contactIdResult] = await connection.query(
    GET_CONTACT_ID_BY_MOBILE_QRY,
    [mobile_number]
  );
  const contactId = contactIdResult[0].id;

  await connection.query(UPDATE_ADDRESS_INFO_QRY, [
    street_1,
    street_2,
    state,
    country,
    contactId,
  ]);

  return contactResult;
};

const deleteContact = async (mobile) => {
  const connection = getConnection();

  // Get contact ID first
  const [contactIdResult] = await connection.query(
    GET_CONTACT_ID_BY_MOBILE_QRY,
    [mobile]
  );
  const contactId = contactIdResult[0].id;

  // Delete address first, then contact
  await connection.query(DELETE_ADDRESS_QRY, [contactId]);
  const [result] = await connection.query(DELETE_CONTACT_QRY, [mobile]);

  return result;
};

export default {
  contactList,
  contactDetails,
  addContact,
  updateContact,
  deleteContact,
};
