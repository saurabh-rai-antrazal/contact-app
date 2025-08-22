// contactRepo.js
import { getConnection } from "../utils/database.js";
import { 
  GET_CONTACTS_QRY, 
  GET_CONTACT_BY_MOBILE_QRY,
  ADD_NEW_CONTACT_QRY,
  UPDATE_CONTACT_INFO_QRY,
  DELETE_CONTACT_QRY
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

const addContact = async (first_name, last_name, mobile_number, email, address, street, state, country, image) => {
  const connection = getConnection();
  const [result] = await connection.query(ADD_NEW_CONTACT_QRY, [
    first_name, 
    last_name, 
    mobile_number, 
    email, 
    address, 
    street, 
    state, 
    country, 
    image
  ]);
  return result;
};

const updateContact = async (first_name, last_name, mobile_number, email, address, street, state, country, image, original_mobile) => {
  const connection = getConnection();
  console.log(first_name, last_name, mobile_number, email, address, street, state, country, image, original_mobile);
  const [result] = await connection.query(UPDATE_CONTACT_INFO_QRY, [
    first_name, 
    last_name, 
    mobile_number, 
    email, 
    address, 
    street, 
    state, 
    country, 
    image,
    original_mobile
  ]);
  console.log(result);
  return result;
};

const deleteContact = async (mobile) => {
  const connection = getConnection();
  const [result] = await connection.query(DELETE_CONTACT_QRY, [mobile]);
  return result;
};

export default {
  contactList,
  contactDetails,
  addContact,
  updateContact,
  deleteContact
};