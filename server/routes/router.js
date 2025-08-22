// routes.js
import { Router } from "express";
import {
  getContacts,
  getContactByMobile,
  addNewContact,
  updateContactInfo,
  deleteContact,
} from "../controller/controller.js";

const routes = Router();

// GET /api/contacts – List all contacts
routes.get("/contacts", getContacts);

// GET /api/contact/:id – Get single contact details
routes.get("/contact/:id", getContactByMobile);

// POST /api/contact – Create a new contact
routes.post("/contact", addNewContact);

// PUT /api/contact/:id – Update contact info
routes.put("/contact/:id", updateContactInfo);

// DELETE /api/contact/:id – Delete a contact
routes.delete("/contact/:id", deleteContact);

export default routes;