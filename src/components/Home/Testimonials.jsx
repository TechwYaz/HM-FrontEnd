import React from "react";
import "./Testimonials.css";

function TestimonialsSection() {
  return (
    <div>
      <div className="testimonials-section">
        <div className="testimonials-container">
          <h2 className="testimonials-title">What Our Customers Say</h2>

          <div className="testimonials-grid">
            <div className="testimonials-card">
              <p className="testimonials-text">
                "Halfmillion Cafe has the best coffee in town! The atmosphere is
                cozy and the staff is friendly. Highly recommend!"
              </p>
              <div className="testimonials-avatar">
                <img src="./Yazan.jpg" alt="Yazan Sofian" />
              </div>
              <h3 className="testimonials-name">Yazan Sofian</h3>
            </div>

            <div className="testimonials-card">
              <p className="testimonials-text">
                "I love coming to Halfmillion Cafe for their delicious pastries
                and great coffee. It's my go-to spot for a quick breakfast or
                afternoon treat."
              </p>

              <div className="testimonials-avatar">
                <img src="./yahia.jpg" alt="Mohammed Salman" />
              </div>
              <h3 className="testimonials-name">Yahia Mostafa</h3>
            </div>

            <div className="testimonials-card">
              <p className="testimonials-text">
                "The staff at Halfmillion Cafe are always so welcoming and the
                quality of their food and drinks is top-notch. I can't get
                enough of their iced coffee!"
              </p>
              <div className="testimonials-avatar">
                <img src="./belly.jpg" alt="Omar Belly" />
              </div>
              <h3 className="testimonials-name">Omar Belly</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestimonialsSection;
