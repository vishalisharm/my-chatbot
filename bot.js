document.addEventListener("DOMContentLoaded", function () {
  const conversationElement = document.getElementById("conversation");
  const userInputElement = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");

  if (!conversationElement || !userInputElement || !sendButton) {
    console.error("One or more required HTML elements not found.");
    return;
  }

  let conversationState = "start";
  let decisionTree;
  let userName;

  function loadDecisionTree(callback) {
    fetch("response.json")
      .then((response) => response.json())
      .then((data) => {
        decisionTree = data;
        callback();
      })
      .catch((error) => {
        console.error("Error loading decision tree:", error);
      });
  }

  function displayMessage(message, sender) {
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("message", sender);
    messageContainer.innerHTML = message;
    conversationElement.appendChild(messageContainer);
    conversationElement.scrollTop = conversationElement.scrollHeight;
  }

  function displayOptions(options) {
    const optionsContainer = document.createElement("div");
    optionsContainer.classList.add("options");

    Object.keys(options).forEach((option) => {
      const optionButton = document.createElement("button");
      optionButton.classList.add("option");
      optionButton.textContent = option;
      optionButton.addEventListener("click", function () {
        handleUserInput(option);
      });
      optionsContainer.appendChild(optionButton);
    });

    if (conversationState !== "start") {
      const restartButton = document.createElement("button");
      restartButton.classList.add("option");
      restartButton.textContent = "Restart Conversation";
      restartButton.addEventListener("click", function () {
        restartConversation();
      });
      optionsContainer.appendChild(restartButton);
    }

    conversationElement.appendChild(optionsContainer);
  }

  function restartConversation() {
    conversationState = "start";
    userName = null;
    displayMessage(decisionTree[conversationState].response, "bot");
    displayOptions(decisionTree[conversationState].options);
  }

  function handleUserInput(userResponse) {
    displayMessage(`User: ${userResponse}`, "user");

    if (userResponse.toLowerCase() === "start") {
      restartConversation();
      return;
    }

    if (!userName) {
      userName = userResponse;
      displayMessage(`MedicineBot: Nice to meet you, ${userName}! What symptoms are you facing?`, "bot");
      conversationState = "user_name";
      displayOptions(decisionTree[conversationState].options);
    } else {
      const currentState = decisionTree[conversationState];
      const options = currentState.options;

      if (options && options[userResponse]) {
        conversationState = options[userResponse];
        displayMessage(decisionTree[conversationState].response, "bot");

        if (decisionTree[conversationState].options) {
          displayOptions(decisionTree[conversationState].options);
        }
      } else {
        displayMessage("Bot: I'm not sure. Please provide a valid response.", "bot");
      }
    }

    userInputElement.value = "";
  }

  sendButton.addEventListener("click", function () {
    const userResponse = userInputElement.value.trim().toLowerCase();
    handleUserInput(userResponse);
  });

  loadDecisionTree(function () {
    restartConversation();
  });
});
