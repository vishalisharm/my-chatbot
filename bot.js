document.addEventListener("DOMContentLoaded", function () {
  const conversationElement = document.getElementById("conversation");
  const userInputElement = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");

  userInputElement.addEventListener("keyup", function (event) {
    // Check if the pressed key is Enter (key code 13)
    if (event.key === "Enter") {
      const userResponse = userInputElement.value.trim().toLowerCase();
      handleUserInput(userResponse);
    }
  });


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
  
    Object.entries(options).forEach(([option, target]) => {
      const optionButton = document.createElement("button");
      optionButton.classList.add("option");
  
      if (target.startsWith("http")) {
        // If the target starts with "http", it's a link
        const linkElement = document.createElement("a");
        linkElement.href = target;
        linkElement.textContent = option;
        optionButton.appendChild(linkElement);
      } else if (target.startsWith("[")) {
        // If the target starts with "[", it's a Markdown-style link
        const linkText = target.substring(1, target.length - 1);
        const linkElement = document.createElement("a");
        linkElement.href = linkText;
        linkElement.textContent = option;
        optionButton.appendChild(linkElement);
      } else {
        optionButton.textContent = option;
        optionButton.addEventListener("click", function () {
          handleUserInput(option);
        });
      }
  
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
      displayMessage(`MedBot: Nice to meet you, ${userName}! What symptoms are you facing?`, "bot");
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
        displayMessage("MedBot: I'm not sure. Please provide a valid response.", "bot");
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
