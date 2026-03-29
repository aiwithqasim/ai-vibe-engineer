# Kanban Project Debugging

## Checklist
- [x] Navigate to http://127.0.0.1:3000
- [x] Attempt to drag 'Setup Repository' card to 'To Do' column
    - Result: Card did not move. It seems to snap back or not react to drag events.
- [x] Attempt to click '×' on 'Setup Repository' card to delete it
    - Result: Clicked at (280, 449), but the card remained in the DOM. No UI update.
- [x] Attempt to add 'New Card' to 'Backlog' column
    - Result: Clicked '+ Add Card' at (183, 856), but no input field appeared. No UI update.
- [x] Check browser console for errors
    - Result: WebSocket connection errors for HMR. No JavaScript runtime errors shown in logs.
- [ ] Report findings step by step
