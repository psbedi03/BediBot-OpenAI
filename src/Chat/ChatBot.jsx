import { useState } from 'react'


import './../App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator} from '@chatscope/chat-ui-kit-react'

const API_KEY = "";

export default function ChatBot() {

    const [typing, setTyping] = useState(false);
    const [messages, setMessages] = useState([
      {
        message: "Hello I am Bedi bot",
        sender: "BediBot",
        direction: "incoming"
  
      }
    ]); 
  
    const handleSend  = async (message) => {
      const newMessage = {
        message: message,
        sender: "user",
        direction: "outgoing"
      }
  
      const newMessages = [...messages, newMessage]; //all other messages, + new message
  
      //update message state
      setMessages(newMessages);
  
      //set typing indicator
      setTyping(true);
  
      //process message over chatGPT (send it over and see the response)
      await processMessagetoChatGPT(newMessages);
    }
    
    async function processMessagetoChatGPT(chatMessages){
        // chatMessages {sender: "user" or "BediBot", message: "The message content goes here"}
        // apiMessages {role: "user" or "assistant", "content": "The message content goes here"}
        
        let apiMessages = chatMessages.map((messageObject) => {
          let role = "";
          if(messageObject.sender === "BediBot"){
            role = "assistant";
          }else{
            role = "user";
          }
    
          return {role: role, content: messageObject.message}
        });
    
        // role: "user" -> a message from the user, "assistant" -> a response from chatGPT
        // "system" -> generally one initial message defining how we want chatGPT to talk
    
        const systemMessage = {
          role: "system",
          /**
           * speak like a pirate, 
           * explain like I am 10 years experience software engineer,
           * speak like a travel agent and be very clear about travel details
           */
          content: "speak like a pirate" 
        }
    
        const apiRequestBody = {
          "model": "gpt-3.5-turbo",
          "messages": [
            systemMessage,//this HAS to be here
            ...apiMessages //[message1, message2, message 3, etc]
          ]
        }
        await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers:  {
            "Authorization": "Bearer "+API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(apiRequestBody)
        }).then((data) => {
          return data.json();
        }).then((data) => {
          console.log(data);
          console.log(data.choices[0].message.content);
          setMessages([...chatMessages, {message: data.choices[0].message.content, sender: 'BediBot', direction: "incoming"}]);
          setTyping(false);
        })
      } 

    return (
        <>
        <div style={{position: 'relative', height: '800px', width: '700px'}}>
          <MainContainer>
            <ChatContainer>
              <MessageList
                scrollBehavior='smooth' 
                typingIndicator = {typing ? <TypingIndicator content="Bedi Bot is typing"/> : null}>
                {messages.map((message, i) => {
                  return <Message key={i} model={message}/>
                })}
              </MessageList>
              <MessageInput placeholder='Type here' onSend= {handleSend}>
  
              </MessageInput>
            </ChatContainer>
          </MainContainer>
        </div>
      </>
    )
}
