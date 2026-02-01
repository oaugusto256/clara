# Clara 💳📊

**Clara** is a personal finance platform designed to help individuals understand their spending, visualize financial patterns, and make better decisions about their money.

The product is built to deliver value **from day one**, even without automatic bank integrations, and to evolve safely into **Open Finance** when it becomes regulatory and financially viable.


## 🎯 Product Vision

- Financial clarity above all
- Immediate value for users
- Trust and transparency with data
- Architecture prepared for future automation

---

## 🧠 Core Features

### 📥 Financial Data Import
- CSV and OFX file uploads
- Support for multiple financial institutions
- Automatic transaction normalization

### 🏷 Intelligent Categorization
- Automatic expense classification
- Declarative, schema-based rules
- Manual adjustments with full reprocessing

### 📊 Financial Visualizations
- Pie charts by category
- Monthly spending evolution
- Comparison between:
  - actual spending
  - recommended budget

### 🧭 Financial Recommendations
- Based on economic studies
- Adjusted by:
  - user location
  - income
  - personal profile
- Fully explainable recommendations

---

## 🔌 Open Finance

This project **does not directly connect to banks** in this repository.

Due to regulatory and compliance constraints, Open Finance integration is treated as:

- An isolated module
- Fully replaceable
- Compatible with authorized data aggregators

A mocked Open Finance flow is used to simulate:
- User consent
- Account synchronization
- Transaction updates

---

## 🧱 Architecture

```text
apps/
├─ web/           # React front-end
└─ api/           # Fastify backend

packages/
├─ schemas/       # Shared Zod schemas
├─ rules-engine/  # Categorization and recommendation logic
└─ ui/            # Design system
```


## 🧠 Rules Engine

The rules engine is responsible for:

- Transaction categorization
- Spending distribution calculations
- Financial recommendation generation

Rules are:
- Declarative
- Versioned
- Fully testable
- Independent from data sources

---

## 💰 Monetization (Product Vision)

- Free plan:
  - Manual data import
  - Basic dashboard
- Premium plan:
  - Automatic sync (Open Finance)
  - Alerts and insights
  - Advanced recommendations
  - Personalized financial reports

---

## 🧪 Testing

- Unit tests for financial rules
- Categorization tests
- Calculation regression tests
- Focus on business logic, not only UI

---

## 🚀 Roadmap

### MVP
- CSV/OFX import
- Financial dashboard
- Basic recommendations

### Future
- Real Open Finance integration
- Smart alerts
- Financial goals
- Long-term financial planning

---

## 📌 Note

This project was built to demonstrate architectural decisions, product thinking, and technical maturity in a realistic personal finance (FinTech) context.