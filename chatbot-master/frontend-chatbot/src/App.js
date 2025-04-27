import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [fromVoice, setFromVoice] = useState(false); // Flag for voice input

  const sendMessage = async (messageText = message) => {
    if (!messageText.trim()) return;

    const userMsg = { sender: "user", text: messageText };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/chat/", {
        message: messageText,
      });

      const botText = response.data.reply;
      const lines = botText.split(/\n+/).filter(Boolean);
      const botMsgs = lines.flatMap((line) =>
        line.match(/^\d+\./) ? [{ sender: "bot", text: line.trim() }] : []
      );

      const finalMsgs =
        botMsgs.length > 0
          ? botMsgs
          : [{ sender: "bot", text: botText.trim() }];

      setMessages((prev) => [...prev, ...finalMsgs]);

      if (fromVoice) {
        speakBotReply(botText.trim());
        setFromVoice(false); // Reset the flag after speaking
      }
    } catch (error) {
      const errorMsg = {
        sender: "bot",
        text: "Sorry, something went wrong. Try again later.",
      };
      setMessages((prev) => [...prev, errorMsg]);

      if (fromVoice) {
        speakBotReply(errorMsg.text);
        setFromVoice(false);
      }
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support voice input.");
      return;
    }

    if (listening) {
      window.speechSynthesis.cancel();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      setMessage(""); // optional: clear the input box
      setFromVoice(true); // set the voice flag
      sendMessage(voiceText); // send voice message
    };

    recognition.start();
  };

  const speakBotReply = (text) => {
    if (listening) return;
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    synth.speak(utterance);
  };

  return (
    <div className="chat-container">
      <h2 className="title">She bot</h2>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <p>{msg.text}</p>
          </div>
        ))}
        {loading && (
          <div className="message bot">
            <p>Typing...</p>
          </div>
        )}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me anything..."
          onKeyDown={handleKeyDown}
        />
        <button onClick={() => sendMessage()} disabled={loading}>
          Send
        </button>
        <button
          onClick={handleVoiceInput}
          className={listening ? "mic-button listening" : "mic-button"}
        >
          🎤
        </button>
      </div>
    </div>
  );
}

export default App;
