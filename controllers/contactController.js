const asyncHandler = require("express-async-handler");
const Contact = require("../models/contactModel");
//@desc get all contacts
//@route GET api/contacts
//@access Private

const getContacts = asyncHandler(async (req, res) => {
  const contact = await Contact.find({ user_id: req.user.id });
  res.status(200).json(contact);
});

//@desc post a contact
//@route POST api/contacts
//@access Private

const createContact = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;
  const user_id = req.user.id;

  if (!name || !email || !phone) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }
  const contact = await Contact.create({
    name,
    email,
    phone,
    user_id,
  });
  res.status(201).json(contact);
});

//@desc get a contact
//@route GET api/contacts/:id
//@access Private

const getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  const user_id = req.user.id;
  if (!contact) {
    res.status(404);
    throw new Error("Contact Not found");
  }

  if (contact.user_id == user_id) {
    res.status(200).json(contact);
  } else {
    res.status(403);
    throw new Error(
      "User doesn't have permission to access other user contacts"
    );
  }
});

//@desc update a contact
//@route PUT api/contacts/:id
//@access Private

const updateContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  const user_id = req.user.id;
  if (!contact) {
    res.status(404);
    throw new Error("Contact Not found");
  }
  if (contact.user_id != user_id) {
    res.status(403);
    throw new Error(
      "User doesn't have permission to access other user contacts"
    );
  }
  const updatedContact = await Contact.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(updatedContact);
});

//@desc delete a contact
//@route DELETE api/contacts/:id
//@access Private

const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  const user_id = req.user.id;

  if (!contact) {
    res.status(404);
    throw new Error("Contact Not found");
  }
  if (contact.user_id != user_id) {
    res.status(403);
    throw new Error(
      "User doesn't have permission to access other user contacts"
    );
  }
  await contact.deleteOne();
  res.status(200).json(contact);
});

module.exports = {
  getContacts,
  createContact,
  getContact,
  updateContact,
  deleteContact,
};
