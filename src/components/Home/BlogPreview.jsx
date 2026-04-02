import React from "react";
import "./BlogPreview.css";

const posts = [
  {
    title: "Meet Our Signature Beans: Notes, Origins, and Pairings",
    image: "/beans.jpg",
    text: "A guided tasting through our house blend, single-origin Ethiopia, and espresso reserve, with pairing ideas that bring out each cup's personality.",
  },
  {
    title: "Welcome to Half Million Cafe: Every Cup Tells a Story",
    image: "/Baristaa.jpg",
    text: "From morning rituals to late-afternoon conversations, this is the story behind our space, our team, and the experience we aim to create every day.",
  },
  {
    title: "5 Must-Try Pastry Recipes Inspired by Our Bakery",
    image: "/Food.jpg",
    text: "A home-baker guide to croissants, morning buns, and signature sweets with practical tips we use in our pastry kitchen every day.",
  },
  {
    title: "Sustainability at Half Million Cafe: Our Commitments",
    image: "/Cups.jpg",
    text: "How we approach ethical sourcing, responsible packaging, and local partnerships to make each cup better for people and the planet.",
  },
  {
    title: "A Love Letter to Slow Afternoons",
    image: "/Memories.jpg",
    text: "An invitation to pause, sip, and enjoy the quieter moments of the day with comforting coffee pairings and calm atmosphere.",
  },
  {
    title: "Barista Spotlight: The Craft Behind Your Cup",
    image: "/Barista.jpg",
    text: "A look behind the espresso bar, from calibration and extraction to the tiny decisions that keep every cup balanced and consistent.",
  },
];

function BlogPreview() {
  return (
    <div className="blog-preview-section">
      <div className="blog-preview-container">
        <h2 className="blog-preview-title">From Our Journal</h2>

        <div className="blog-preview-grid">
          {posts.map((post) => (
            <article key={post.title} className="blog-preview-card">
              <img
                src={post.image}
                alt={post.title}
                className="blog-preview-card-image"
              />
              <h3 className="blog-preview-card-title">{post.title}</h3>
              <p className="blog-preview-card-text">{post.text}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BlogPreview;
