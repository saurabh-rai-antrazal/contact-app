// controller.js
import contactRepo from "../repo/contactRepo.js";

export const getContacts = async (req, res) => {
  try {
    const contacts = await contactRepo.contactList();
    res.status(200).json(contacts);
  } catch (err) {
    res
      .status(500)
      .json({ success: "false", error: "Failed to fetch contacts" });
  }
};

export const getContactByMobile = async (req, res) => {
  try {
    const mobile = req.params.id;
    const data = await contactRepo.contactDetails(mobile);

    if (data.length === 0) {
      return res.status(404).json({ success: "false", error: "Id not found" });
    }

    res.status(200).json(data[0]);
  } catch (err) {
    res
      .status(500)
      .json({ success: "false", error: "Failed to fetch contact details" });
  }
};

export const addNewContact = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      mobile_number,
      email,
      address,
      street,
      state,
      country,
      image,
    } = req.body;

    // console.log(first_name, last_name, mobile_number, email, address, street, state, country, image);
    console.log(req.body);

    // Basic validation
    if (!first_name || !mobile_number) {
      return res
        .status(400)
        .json({
          success: "false",
          error: "First name and mobile number are required",
        });
    }

    // Check if contact already exists
    const existingContact = await contactRepo.contactDetails(mobile_number);
    if (existingContact.length > 0) {
      return res
        .status(409)
        .json({
          success: "false",
          error: "Contact with this mobile number already exists",
        });
    }

    await contactRepo.addContact(
      first_name,
      last_name,
      mobile_number,
      email,
      address,
      street,
      state,
      country,
      image
    );

    res.status(201).json({
      success: "true",
      message: "Contact added successfully",
    });
  } catch (err) {
    res.status(500).json({ success: "false", error: "Failed to add contact" });
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
      address,
      street,
      state,
      country,
      image,
    } = req.body;

    if (!first_name || !mobile_number) {
      return res
        .status(400)
        .json({
          success: "false",
          error: "First name and mobile number are required",
        });
    }

    // Check if contact exists
    const existingContact = await contactRepo.contactDetails(mobile);
    if (existingContact.length === 0) {
      return res
        .status(404)
        .json({ success: "false", error: "Contact with this mobile number already exists" });
    }

    const result = await contactRepo.updateContact(
      first_name,
      last_name,
      mobile_number,
      email,
      address,
      street,
      state,
      country,
      image,
      mobile
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: "false", error: "Contact not found" });
    }

    res
      .status(200)
      .json({ success: "true", message: "Contact updated successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ success: "false", error: "Failed to update contact" });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const mobile = req.params.id;

    const result = await contactRepo.deleteContact(mobile);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: "false", error: "Contact not found" });
    }
    res
      .status(200)
      .json({ success: "true", message: "Contact deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ success: "false", error: "Failed to delete contact" });
  }
};
