from groq import Groq
from dotenv import load_dotenv
load_dotenv()

from rag_pipeline import ask_question
from llm import generate_general_explanation

question = "What is macbook?"

result = ask_question(question)

if result["status"] == "not_found":

    print(result["message"])

    choice = input("Type YES if you want an explanation: ")

    if choice.lower() == "yes":

        explanation = generate_general_explanation(question)

        print("\nExplanation:\n")
        print(explanation)

else:

    print("\nANSWER:\n")
    print(result["answer"])

    print("\nRelevant timestamps:\n")

    for c in result["chunks"]:
        print(c["start"], "→", c["end"])