import { useState } from "react";
import "./Faq.css";

const faqs = [
  {
    question: "Do I need a reservation to dine in?",
    answer:
      "Walk-ins are always welcome, but reservations are recommended during evenings and weekends to avoid waiting.",
  },
  {
    question: "What are your delivery hours?",
    answer:
      "Delivery is available daily from 10:00 AM to 11:30 PM. In peak hours, delivery times may be slightly longer.",
  },
  {
    question: "Do you offer vegetarian options?",
    answer:
      "Yes. We have a growing vegetarian section including breakfast dishes, salads, and drinks.",
  },
  {
    question: "How can I track my order?",
    answer:
      "After checkout, you can monitor your order status from your profile page under recent orders.",
  },
  {
    question: "Can I modify or cancel an order after placing it?",
    answer:
      "You can request changes if preparation has not started yet. Contact us quickly through our support channels.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We currently support cash on delivery and card payments where card processing is available.",
  },
];

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <article className="faq-item">
      <button
        type="button"
        className="faq-question"
        onClick={onToggle}
        aria-expanded={isOpen}>
        <span>{item.question}</span>
        <span className="faq-icon" aria-hidden="true">
          {isOpen ? "-" : "+"}
        </span>
      </button>
      {isOpen && <p className="faq-answer">{item.answer}</p>}
    </article>
  );
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  const handleToggle = (index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <main className="faq-page">
      <section className="faq-hero">
        <p className="faq-kicker">Support</p>
        <h1>Frequently Asked Questions</h1>
        <p>
          Everything guests ask us the most. If you still need help, reach out
          and we will assist you.
        </p>
      </section>

      <section className="faq-list" aria-label="Frequently asked questions">
        {faqs.map((item, index) => (
          <FaqItem
            key={item.question}
            item={item}
            isOpen={openIndex === index}
            onToggle={() => handleToggle(index)}
          />
        ))}
      </section>
    </main>
  );
}
