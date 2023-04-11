import { useEffect, useState } from "react";
import { Configuration, OpenAIApi } from "openai";

const Chat = () => {
  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  async function getChatCompletion(messages) {
    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an DoctorGPT, i am a patient that is going to ask you about symptoms or a condition I am experiencing, please help me with my question. ",
          },
          ...messages,
        ],
      });

      return {
        jsonBody: {
          completion: completion.data.choices[0].message,
        },
      };
    } catch (error) {
      console.error(error);
      return {
        jsonBody: { completion: "Error: Unable to fetch response from API." },
      };
    }
  }

  const [userInput, setUserInput] = useState("");

  const [conversation, setConversation] = useState([]);

  useEffect(() => {
    const fetchFirst = async () => {
      try {
        const messages = [
          {
            role: "user",
            content:
              "Please greet me as if I am a patient who just walked in."
          },
        ];
        const result = await getChatCompletion(messages);
        console.log(result.jsonBody.completion.content)
        setConversation([
          { role: "user", content: messages[0].content },
          {
            role: "assistant",
            content: result.jsonBody.completion.content,
          },
        ]);
      } catch (error) {
        console.error("Error fetching first response:", error);
      }
    };

    fetchFirst();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await getChatCompletion(
      conversation.concat([{ role: "user", content: userInput }])
    );

    setConversation((prevConversation) => [
      ...prevConversation,
      { role: "user", content: userInput },
      {
        role: "assistant",
        content: result.jsonBody.completion.content,
      },
    ]);
    setUserInput('')
  };

  return (
    <div className="GPT">
      <h1 className="MD">AI MD</h1>
      <div className="form">
        <form onSubmit={handleSubmit}>
          <input
            className="input"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="How could I help you today?"
          />
          <button className="submit" type="submit">
            Submit
          </button>
        </form>
      </div>
      <div className="response">
        {conversation.slice(1).map((elem, index) => {
          return (
            <p key={index}>
              <strong>{elem.role === "user" ? "You: " : "AI Doctor: "}</strong>
              {elem.content}
            </p>
          );
        })}
      </div>
    </div>
  );
};

export default Chat;
