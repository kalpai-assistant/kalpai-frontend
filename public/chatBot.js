(function () {
  const loadChatbot = (businessId) => {
    const iframeUrl = `https://app.kalpai.in/business/${businessId}`;

    // Ensure the widget is appended only after DOM is ready
    document.addEventListener("DOMContentLoaded", () => {
      // Create the chatbot widget container
      const widgetContainer = document.createElement("div");
      widgetContainer.id = "chatbot-widget-container";
      widgetContainer.style.position = "fixed";
      widgetContainer.style.bottom = "20px";
      widgetContainer.style.right = "20px";
      widgetContainer.style.zIndex = "9999";

      // Create the chat bubble
      const chatBubble = document.createElement("div");
      chatBubble.id = "chatbot-bubble";
      chatBubble.style.width = "60px";
      chatBubble.style.height = "60px";
      chatBubble.style.backgroundColor = "#007bff";
      chatBubble.style.borderRadius = "50%";
      chatBubble.style.display = "flex";
      chatBubble.style.justifyContent = "center";
      chatBubble.style.alignItems = "center";
      chatBubble.style.cursor = "pointer";
      chatBubble.style.color = "#fff";
      chatBubble.style.fontSize = "24px";
      chatBubble.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
      chatBubble.innerHTML = "💬";

      // Create the iframe for the chatbot
      const iframeContainer = document.createElement("div");
      iframeContainer.id = "chatbot-iframe-container";
      iframeContainer.style.position = "fixed";
      iframeContainer.style.bottom = "-600px"; // Initially hidden
      iframeContainer.style.right = "20px";
      iframeContainer.style.width = "400px";
      iframeContainer.style.height = "600px";
      iframeContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
      iframeContainer.style.backgroundColor = "#fff";
      iframeContainer.style.borderRadius = "8px";
      iframeContainer.style.overflow = "hidden";
      iframeContainer.style.transition = "bottom 0.4s ease"; // Smooth transition

      const iframe = document.createElement("iframe");
      iframe.src = iframeUrl;
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";
      iframeContainer.appendChild(iframe);

      // Toggle the chatbot on click
      let isOpen = false;
      chatBubble.addEventListener("click", () => {
        if (isOpen) {
          iframeContainer.style.bottom = "-600px"; // Slide down to hide
        } else {
          iframeContainer.style.bottom = "90px"; // Slide up to show
        }
        isOpen = !isOpen;
      });

      widgetContainer.appendChild(chatBubble);
      widgetContainer.appendChild(iframeContainer);
      document.body.appendChild(widgetContainer);
    });
  };

  const script = document.currentScript;
  const businessId = script.getAttribute("data-business-id");

  if (businessId) {
    loadChatbot(businessId);
  } else {
    console.error("Chatbot: No business ID provided.");
  }
})();
