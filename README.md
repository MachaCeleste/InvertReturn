# InvertReturn

A Vencord plugin that adds a toggle checkbox right into your Discord chat input toolbar, allowing you to seamlessly invert the behavior of **Enter** and **Shift+Enter**.

## Features
- **Clean UI Integration**: Mounts a compact toggle checkbox dynamically into the text input's button toolbar next to the gift and GIF options.
- **Inverted Workflow**: 
  - When **checked**: 
    - Pressing **Enter** inputs a clean multi-line break (`\n`) without submitting.
    - Pressing **Shift+Enter** immediately transmits the entire message payload.
  - When **unchecked**: 
    - Restores standard Discord chat default settings.
- **Safe Fallbacks**: Directly hooks into Slate's internal editor components to prevent placeholder glitches and utilizes smart element queries to safely handle hidden send buttons.