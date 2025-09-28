# LangGraph for Beginners: Code Samples

Welcome to LangGraph for Beginners! This repository contains code samples and Jupyter notebooks designed to help you learn and experiment with LangGraph and LLM-powered workflows.


## Structure

- `notebooks/` — Jupyter notebooks for hands-on exercises and tutorial examples.
   - `01_Notebook_FirstChatBot.ipynb` — Minimal chatbot using LangGraph and ChatOpenAI.
   - `02_Notebook_MultipleBot.ipynb` — Arithmetic and state-driven nodes.
   - `03_Notebook_ConditionalEdge.ipynb` — Conditional routing example.
   - `04_Notebook_Loop.ipynb` — Looping/iteration in StateGraph.
   - `05_Notebook_SimpleChatBot.ipynb` — Another simple chatbot example.
- `mini agents/` — Python scripts for agent demos.
   - `05_SimpleChatBot.py` — Simple chatbot agent script.
- `.env.example` — Example environment file. Copy to `.env` and add your OpenAI API key.

## Getting Started

1. Clone this repository.
2. Install Python 3.8+ and Jupyter.
3. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
4. Install required packages:
   ```bash
   pip install langgraph langchain-openai python-dotenv jupyter
   ```
5. Copy `.env.example` to `.env` and add your OpenAI API key:
   ```
   cp .env.example .env
   # Then edit .env and add your actual key
   OPENAI_API_KEY=sk-...your-key-here...
   ```
6. Open the notebooks in Jupyter and follow the instructions.

## Requirements

- Python 3.8 or higher
- Jupyter Notebook or JupyterLab
- LangGraph
- LangChain OpenAI
- OpenAI API key (for ChatGPT integration)
- python-dotenv (for environment variables)

## Status

This tutorial is **under development**. More notebooks and code samples will be added soon. Feel free to explore, experiment, and contribute!

## Contributing

Pull requests and suggestions are welcome. If you find issues or have ideas for improvement, please open an issue or submit a PR.

## License

See the `LICENSE` file for details.
---

# نسخه فارسی

به دوره "LangGraph برای مبتدیان" خوش آمدید! این مخزن شامل نمونه کدها و نوت‌بوک‌های Jupyter است که به شما کمک می‌کند با LangGraph و جریان‌های کاری مبتنی بر مدل‌های زبانی بزرگ (LLM) یاد بگیرید و آزمایش کنید.


## ساختار

- `notebooks/` — نوت‌بوک‌های Jupyter برای تمرین‌های عملی و مثال‌های آموزشی.
   - `01_Notebook_FirstChatBot.ipynb` — چت‌بات ساده با LangGraph و ChatOpenAI.
   - `02_Notebook_MultipleBot.ipynb` — گره‌های حسابی و مبتنی بر وضعیت.
   - `03_Notebook_ConditionalEdge.ipynb` — مثال مسیردهی شرطی.
   - `04_Notebook_Loop.ipynb` — حلقه/تکرار در StateGraph.
   - `05_Notebook_SimpleChatBot.ipynb` — یک چت‌بات ساده دیگر.
- `mini agents/` — اسکریپت‌های پایتون برای دموهای ایجنت.
   - `05_SimpleChatBot.py` — اسکریپت چت‌بات ساده.
- `.env.example` — فایل نمونه متغیر محیطی. این فایل را به `.env` کپی کنید و کلید OpenAI خود را وارد کنید.

## شروع کار

1. این مخزن را کلون کنید.
2. پایتون ۳.۸ یا بالاتر و Jupyter را نصب کنید.
3. یک محیط مجازی بسازید و آن را فعال کنید:
   ```bash
   python -m venv venv
   source venv/bin/activate  # در ویندوز: venv\Scripts\activate
   ```
4. بسته‌های مورد نیاز را نصب کنید:
   ```bash
   pip install langgraph langchain-openai python-dotenv jupyter
   ```
5. فایل `.env.example` را به `.env` کپی کنید و کلید OpenAI خود را وارد کنید:
   ```
   cp .env.example .env
   # سپس فایل .env را ویرایش کنید و کلید واقعی خود را وارد کنید
   OPENAI_API_KEY=sk-...your-key-here...
   ```
6. نوت‌بوک‌ها را در Jupyter باز کنید و دستورالعمل‌ها را دنبال کنید.

## پیش‌نیازها

- پایتون ۳.۸ یا بالاتر
- Jupyter Notebook یا JupyterLab
- LangGraph
- LangChain OpenAI
- کلید API OpenAI (برای یکپارچگی با ChatGPT)
- python-dotenv (برای متغیرهای محیطی)

## وضعیت

این آموزش **در حال توسعه** است. نوت‌بوک‌ها و نمونه کدهای بیشتری به زودی اضافه خواهند شد. با خیال راحت کاوش کنید، آزمایش کنید و مشارکت داشته باشید!

## مشارکت

پیشنهادات و Pull Requestها خوش‌آمد هستند. اگر مشکلی پیدا کردید یا ایده‌ای برای بهبود دارید، لطفاً یک Issue باز کنید یا PR ارسال کنید.

## مجوز

برای جزئیات بیشتر به فایل `LICENSE` مراجعه کنید.

---

This repository is made with ❤️ LOVE.

---

این مخزن با عشق ❤️ ساخته شده است.

