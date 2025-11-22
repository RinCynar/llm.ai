/**
 * LLM Chat App Frontend
 *
 * Handles the chat UI interactions and communication with the backend API.
 */

// DOM elements
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");
const themeSwitcher = document.getElementById("theme-switcher");
const body = document.body;

// Theme switching
themeSwitcher.addEventListener("click", () => {
	const isDark = body.dataset.theme === "dark";
	const newTheme = isDark ? "light" : "dark";
	body.dataset.theme = newTheme;
	localStorage.setItem("theme", newTheme);
	themeSwitcher.selected = newTheme === "dark";
});

// Load saved theme
document.addEventListener("DOMContentLoaded", () => {
	const savedTheme = localStorage.getItem("theme") || "dark"; // Default to dark
	body.dataset.theme = savedTheme;
	themeSwitcher.selected = savedTheme === "dark";
});

// Chat state
let chatHistory = [
	{
		role: "assistant",
		content:
			"Hello! I'm an LLM chat app powered by Cloudflare Workers AI. How can I help you today?",
	},
];
let isProcessing = false;

// Auto-resize textarea - Material text field handles this automatically
userInput.addEventListener("input", () => {
	// The md-outlined-text-field auto-resizes, so no manual height adjustment is needed.
});

// Send message on Enter (without Shift)
userInput.addEventListener("keydown", function (e) {
	if (e.key === "Enter" && !e.shiftKey) {
		e.preventDefault();
		sendMessage();
	}
});

// Send button click handler
sendButton.addEventListener("click", sendMessage);

/**
 * Sends a message to the chat API and processes the response
 */
async function sendMessage() {
	const message = userInput.value.trim();

	// Don't send empty messages
	if (message === "" || isProcessing) return;

	// Disable input while processing
	isProcessing = true;
	userInput.disabled = true;
	sendButton.disabled = true;

	// Add user message to chat
	addMessageToChat("user", message);

	// Clear input
	userInput.value = "";

	// Show typing indicator
	typingIndicator.classList.add("visible");

	// Add message to history
	chatHistory.push({ role: "user", content: message });

	try {
		// Create new assistant response element
		const assistantMessageEl = document.createElement("div");
		assistantMessageEl.className = "message assistant-message";
		assistantMessageEl.innerHTML = "<p></p>";
		chatMessages.appendChild(assistantMessageEl);

		// Scroll to bottom
		chatMessages.scrollTop = chatMessages.scrollHeight;

		// Send request to API
		const response = await fetch("/api/chat", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				messages: chatHistory,
			}),
		});

		// Handle errors
		if (!response.ok) {
			throw new Error("Failed to get response");
		}

		// Process streaming response
		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let responseText = "";

		while (true) {
			const { done, value } = await reader.read();

			if (done) {
				break;
			}

			// Decode chunk
			const chunk = decoder.decode(value, { stream: true });

			// Process SSE format
			const lines = chunk.split("\n");
			for (const line of lines) {
				if (line.startsWith("data: ")) {
					try {
						const jsonData = JSON.parse(line.substring(6));
						if (jsonData.response) {
							// Append new content to existing text
							responseText += jsonData.response;
							assistantMessageEl.querySelector("p").textContent = responseText;

							// Scroll to bottom
							chatMessages.scrollTop = chatMessages.scrollHeight;
						}
					} catch (e) {
						// Ignore empty lines or parsing errors
					}
				}
			}
		}

		// Add completed response to chat history
		chatHistory.push({ role: "assistant", content: responseText });
	} catch (error) {
		console.error("Error:", error);
		addMessageToChat(
			"assistant",
			"Sorry, there was an error processing your request.",
		);
	} finally {
		// Hide typing indicator
		typingIndicator.classList.remove("visible");

		// Re-enable input
		isProcessing = false;
		userInput.disabled = false;
		sendButton.disabled = false;
		userInput.focus();
	}
}

/**
 * Helper function to add message to chat
 */
function addMessageToChat(role, content) {
	const messageEl = document.createElement("div");
	messageEl.className = `message ${role}-message`;
	messageEl.innerHTML = `<p>${content}</p>`;
	chatMessages.appendChild(messageEl);

	// Scroll to bottom
	chatMessages.scrollTop = chatMessages.scrollHeight;
}
