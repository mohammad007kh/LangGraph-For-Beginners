# LangGraph for Beginners: Code Samples

Welcome to LangGraph for Beginners! This repository contains code samples and Jupyter notebooks designed to help you learn and experiment with LangGraph and LLM-powered workflows.

## Structure

- `notebooks/` — Contains Jupyter notebooks for hands-on exercises and tutorial examples.
   - `01_Notebook_FirstChatBot.ipynb` — Build a minimal chatbot using LangGraph and an LLM (ChatOpenAI).
   - `02_Notebook_MultipleBot.ipynb` — Demonstrates creating nodes that perform arithmetic operations and state-driven responses.
   - `03_Notebook_ConditionalEdge.ipynb` — Shows conditional routing between nodes (e.g., gender-based body-fat calculation).
   - `04_Notebook_Loop.ipynb` — Example of looping/iteration in a StateGraph (a number-guessing game with conditional continuation).

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
5. Create a `.env` file in the project root and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
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

- `notebooks/` — شامل نوت‌بوک‌های Jupyter برای تمرین‌های عملی و مثال‌های آموزشی است.
   - `01_Notebook_FirstChatBot.ipynb` — ساخت یک چت‌بات ساده با LangGraph و LLM (ChatOpenAI).
   - `02_Notebook_MultipleBot.ipynb` — نشان می‌دهد چگونه گره‌هایی بسازیم که عملیات حسابی و پاسخ مبتنی بر وضعیت را انجام می‌دهند.
   - `03_Notebook_ConditionalEdge.ipynb` — نشان‌دهنده مسیردهی شرطی بین گره‌ها (مثلاً محاسبه درصد چربی بدن بر اساس جنسیت).
   - `04_Notebook_Loop.ipynb` — مثال حلقه/تکرار در StateGraph (بازی حدس عدد با ادامه/پایان شرطی).

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
5. یک فایل `.env` در ریشه پروژه بسازید و کلید API OpenAI خود را اضافه کنید:
   ```
   OPENAI_API_KEY=your_api_key_here
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

