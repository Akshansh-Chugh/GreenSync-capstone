# Checks

This folder contains request validation helpers used before controller logic runs.

## Current File

- `ownerCheck.js` validates required owner/caretaker fields before create or update operations.

## Role in the Backend

Checks are lightweight guards that keep controller functions cleaner by rejecting incomplete or invalid input early.