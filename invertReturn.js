import definePlugin from "@utils/types";
import { React } from "@webpack/common";

export default definePlugin({
    name: "InvertReturn",
    description: "Flips Enter and Shift+Enter behavior via a checkbox to the right of the input field.",
    authors: [{ name: "Macha", id: 184747491063758858n }],

    start() {
        this.unsubKeydown = document.addEventListener("keydown", (e) => {
            if (e.key !== "Enter" || e._bypassedByInvert) return;
            const target = e.target;
            if (!target.classList || (!target.classList.contains("slateTextArea_e52107") && !target.getAttribute("role")?.includes("textbox"))) return;

            const invertFlag = window._vencordInvertEnterState ?? false;
            if (!invertFlag) return;

            if (!e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                e.stopImmediatePropagation();
                const getSlateEditor = (el) => {
                    const fiberKey = Object.keys(el).find(k => k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$"));
                    if (!fiberKey) return null;
                    let fiber = el[fiberKey];
                    while (fiber) {
                        if (fiber.memoizedProps?.editor) return fiber.memoizedProps.editor;
                        if (fiber.stateNode?.editor) return fiber.stateNode.editor;
                        fiber = fiber.return;
                    }
                    return null;
                };
                const editor = getSlateEditor(target);
                if (editor) {
                    editor.insertBreak();
                } else {
                    document.execCommand("insertText", false, "\n");
                }
            } else if (e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                e.stopImmediatePropagation();

                const chatContainer = target.closest('form') || target.closest('[class*="channelTextArea"]');
                const sendButton = chatContainer?.querySelector('button[class*="sendButton"]') || 
                                   Array.from(chatContainer?.querySelectorAll('button') || []).find(b => b.getAttribute('aria-label') === 'Send');

                if (sendButton) {
                    sendButton.click();
                } else {
                    const syntheticEvent = new KeyboardEvent("keydown", {
                        key: "Enter",
                        code: "Enter",
                        bubbles: true,
                        cancelable: true,
                        shiftKey: false
                    });
                    syntheticEvent._bypassedByInvert = true;
                    target.dispatchEvent(syntheticEvent);
                }
            }
        }, true);

        this.observer = new MutationObserver(() => {
            const textarea = document.querySelector('[class*="slateTextArea"]');
            if (!textarea) return;

            const chatContainer = textarea.closest('form') || textarea.closest('[class*="channelTextArea"]');
            if (!chatContainer) return;

            const buttonsContainer = chatContainer.querySelector('[class*="buttons"]');
            if (buttonsContainer && !buttonsContainer.querySelector("#invert-return-checkbox-host")) {
                const host = document.createElement("div");
                host.id = "invert-return-checkbox-host";
                host.style.cssText = "display: flex; align-items: center; justify-content: center; padding: 0 4px; cursor: pointer;";
                buttonsContainer.prepend(host);
                
                this.renderVanillaCheckbox(host);
            }
        });

        this.observer.observe(document.body, { childList: true, subtree: true });
    },

    stop() {
        if (this.unsubKeydown) {
            document.removeEventListener("keydown", this.unsubKeydown, true);
        }
        if (this.observer) {
            this.observer.disconnect();
        }
        const host = document.getElementById("invert-return-checkbox-host");
        if (host) host.remove();
    },

    renderVanillaCheckbox(container) {
        const updateState = () => {
            container.innerHTML = "";
            const checked = window._vencordInvertEnterState || false;

            const label = document.createElement("label");
            label.style.cssText = "display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 4px;";
            label.title = "Invert Enter/Shift+Enter behavior";

            const input = document.createElement("input");
            input.type = "checkbox";
            input.checked = checked;
            input.style.cssText = "cursor: pointer; width: 16px; height: 16px; accent-color: var(--brand-experiment);";
            input.onchange = (e) => {
                window._vencordInvertEnterState = e.target.checked;
                updateState();
            };

            label.appendChild(input);
            container.appendChild(label);
        };

        updateState();
    }
});