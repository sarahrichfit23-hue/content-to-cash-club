"use client";
import * as React from "react";

export default function Pricing() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Pricing</h2>
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "2rem",
        marginTop: "2rem"
      }}>
        {/* Starter Plan */}
        <div style={{
          border: "1px solid #eee",
          borderRadius: "8px",
          padding: "2rem",
          width: "250px"
        }}>
          <h3>Starter</h3>
          <p style={{ fontSize: "2rem", margin: "0.5rem 0" }}>$1<span style={{ fontSize: "1rem" }}>/month</span></p>
          <p>Perfect for coaches just starting</p>
          <ul style={{ textAlign: "left", margin: "1rem 0" }}>
            <li>✓ Current + last 2 months packs</li>
            <li>✓ AI personalizer</li>
            <li>✓ Save & export content</li>
            <li>✓ Community access</li>
            <li>✓ Swipe of the Month</li>
            <li>✓ 50 generations/month</li>
          </ul>
          <a
            href="/signup?plan=starter"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              background: "#111",
              color: "#fff",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: 600
            }}
          >
            Start Free Trial
          </a>
        </div>

        {/* Pro Plan */}
        <div style={{
          border: "2px solid gold",
          borderRadius: "8px",
          padding: "2rem",
          width: "250px",
          background: "#fffbea"
        }}>
          <h3>Pro <span style={{
            background: "gold",
            color: "#222",
            borderRadius: "4px",
            padding: "2px 6px",
            fontSize: "0.9rem",
            marginLeft: "6px"
          }}>Most Popular</span></h3>
          <p style={{ fontSize: "2rem", margin: "0.5rem 0" }}>$2<span style={{ fontSize: "1rem" }}>/month</span></p>
          <p>For coaches ready to scale</p>
          <ul style={{ textAlign: "left", margin: "1rem 0" }}>
            <li>✓ Everything in Starter</li>
            <li>✓ Full back catalog access</li>
            <li>✓ Bulk generation (20 assets)</li>
            <li>✓ Scheduled exports</li>
            <li>✓ Bonus swipes</li>
            <li>✓ Quarterly workshops</li>
            <li>✓ 300 generations/month</li>
          </ul>
          <a
            href="/signup?plan=pro"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              background: "gold",
              color: "#222",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: 600
            }}
          >
            Start Free Trial
          </a>
        </div>

        {/* Elite Plan */}
        <div style={{
          border: "1px solid #eee",
          borderRadius: "8px",
          padding: "2rem",
          width: "250px"
        }}>
          <h3>Elite</h3>
          <p style={{ fontSize: "2rem", margin: "0.5rem 0" }}>$3<span style={{ fontSize: "1rem" }}>/month</span></p>
          <p>For high-volume creators</p>
          <ul style={{ textAlign: "left", margin: "1rem 0" }}>
            <li>✓ Everything in Pro</li>
            <li>✓ Monthly group clinic</li>
            <li>✓ Priority review thread</li>
            <li>✓ White-label rights (10 clients)</li>
            <li>✓ Custom templates</li>
            <li>✓ 1,000 generations/month</li>
            <li>✓ Direct Slack access</li>
          </ul>
          <a
            href="/signup?plan=elite"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              background: "#111",
              color: "#fff",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: 600
            }}
          >
            Start Free Trial
          </a>
        </div>
      </div>
      <p style={{marginTop: "2rem", color: "#777"}}>
        7-day free trial • Cancel anytime • No credit card required
      </p>
    </div>
  );
}