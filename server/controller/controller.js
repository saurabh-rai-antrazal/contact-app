// controller.js
import contactRepo from "../repo/contactRepo.js";
import * as stmt from "../utils/const.js";

export const getContacts = async (req, res) => {
  try {
    const contacts = await contactRepo.contactList();
    res.status(200).json(contacts);
  } catch (err) {
    res
      .status(500)
      .json({
        success: "false",
        error: stmt.FAILED_TO_FETCH_CONTACTS,
        details: err.message,
      });
  }
};

export const getContactByMobile = async (req, res) => {
  try {
    const mobile = req.params.id;
    const data = await contactRepo.contactDetails(mobile);
    if (data.length === 0) {
      return res
        .status(404)
        .json({ success: "false", error: stmt.CONTACT_NOT_FOUND });
    }
    res.status(200).json(data[0]);
  } catch (err) {
    res
      .status(500)
      .json({ success: "false", error: stmt.FAILED_TO_FETCH_CONTACT_DETAILS });
  }
};

export const addNewContact = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      mobile_number,
      email,
      street_1,
      street_2,
      state,
      country,
      image,
    } = req.body;

    console.log(req.body);

    // Basic validation
    if (!first_name || !mobile_number) {
      return res.status(400).json({
        success: "false",
        error: stmt.FIRST_NAME_AND_MOBILE_REQUIRED,
      });
    }

    // Check if contact already exists
    const existingContact = await contactRepo.contactDetails(mobile_number);
    if (existingContact.length > 0) {
      return res.status(409).json({
        success: "false",
        error: stmt.CONTACT_ALREADY_EXISTS,
      });
    }

    await contactRepo.addContact(
      first_name,
      last_name,
      mobile_number,
      email,
      street_1,
      street_2,
      state,
      country,
      image
    );

    res.status(201).json({
      success: "true",
      message: stmt.CONTACT_ADDED_SUCCESSFULLY,
    });
  } catch (err) {
    console.error("Add contact error:", err);
    res.status(500).json({ success: "false", error: stmt.FAILED_TO_ADD_CONTACT });
  }
};

export const updateContactInfo = async (req, res) => {
  try {
    const mobile = req.params.id;
    const {
      first_name,
      last_name,
      mobile_number,
      email,
      street_1,
      street_2,
      state,
      country,
      image,
    } = req.body;

    if (!first_name || !mobile_number) {
      return res.status(400).json({
        success: "false",
        error: stmt.FIRST_NAME_AND_MOBILE_REQUIRED,
      });
    }

    // Check if contact exists
    const existingContact = await contactRepo.contactDetails(mobile);
    if (existingContact.length === 0) {
      return res
        .status(404)
        .json({ success: "false", error: stmt.CONTACT_NOT_FOUND });
    }

    const result = await contactRepo.updateContact(
      first_name,
      last_name,
      mobile_number,
      email,
      street_1,
      street_2,
      state,
      country,
      image,
      mobile
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: "false", error: stmt.CONTACT_NOT_FOUND });
    }

    res
      .status(200)
      .json({ success: "true", message: stmt.CONTACT_UPDATED_SUCCESSFULLY });
  } catch (err) {
    console.error("Update contact error:", err);
    res
      .status(500)
      .json({ success: "false", error: stmt.FAILED_TO_UPDATE_CONTACT });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const mobile = req.params.id;

    // Check if contact exists first
    const existingContact = await contactRepo.contactDetails(mobile);
    if (existingContact.length === 0) {
      return res
        .status(404)
        .json({ success: "false", error: stmt.CONTACT_NOT_FOUND });
    }

    const result = await contactRepo.deleteContact(mobile);

    res
      .status(200)
      .json({ success: "true", message: stmt.CONTACT_DELETED_SUCCESSFULLY });
  } catch (err) {
    console.error("Delete contact error:", err);
    res
      .status(500)
      .json({ success: "false", error: stmt.FAILED_TO_DELETE_CONTACT });
  }
};
