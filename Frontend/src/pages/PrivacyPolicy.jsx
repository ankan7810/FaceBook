import React, { useEffect, useState } from "react";

const PrivacyPolicy = () => {
  const [createdAt, setCreatedAt] = useState(null);

  useEffect(() => {
    const storedTime = localStorage.getItem("privacy_policy_created");

    if (storedTime) {
      setCreatedAt(storedTime);
    } else {
      const now = new Date().toISOString();
      localStorage.setItem("privacy_policy_created", now);
      setCreatedAt(now);
    }
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Privacy Policy</h1>

        <p style={styles.updated}>
          Last update at:{" "}
          {createdAt ? formatDate(createdAt) : "Loading..."}
        </p>

        <section>
          <h3>1. Information We Collect</h3>
          <p>
            We collect information you provide directly such as your name, email,
            profile details, posts, photos, and interactions with other users.
          </p>
        </section>

        <section>
          <h3>2. How We Use Your Information</h3>
          <p>
            Your data is used to provide and improve our services, personalize
            content, enable communication between users, and ensure platform
            security.
          </p>
        </section>

        <section>
          <h3>3. Sharing of Information</h3>
          <p>
            We do not sell your personal data. Information may be shared with
            trusted services (such as storage, authentication, or analytics)
            required to operate the platform.
          </p>
        </section>

        <section>
          <h3>4. Data Security</h3>
          <p>
            We implement industry-standard security practices. However, no method
            of transmission over the internet is completely secure.
          </p>
        </section>

        <section>
          <h3>5. Your Rights</h3>
          <p>
            You can update, modify, or delete your personal data anytime from
            your account settings.
          </p>
        </section>

        <section>
          <h3>6. Cookies</h3>
          <p>
            We use cookies to enhance user experience, remember preferences, and
            analyze usage patterns.
          </p>
        </section>

        <section>
          <h3>7. Third-Party Links</h3>
          <p>
            Our platform may contain links to third-party websites. We are not
            responsible for their privacy practices.
          </p>
        </section>

        <section>
          <h3>8. Changes to This Policy</h3>
          <p>
            We may update this policy from time to time. Continued use of the
            platform means you accept the updated policy.
          </p>
        </section>

        <section>
          <h3>9. Contact Us</h3>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at: <b>support@yourapp.com</b>
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

const styles = {
  container: {
    minHeight: "100vh",
    background: "#18191a",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px 20px",
  },
  card: {
    width: "800px",
    maxWidth: "100%",
    background: "#242526",
    borderRadius: "12px",
    padding: "30px",
    color: "#e4e6eb",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
  title: {
    fontSize: "28px",
    marginBottom: "10px",
  },
  updated: {
    fontSize: "13px",
    color: "#b0b3b8",
    marginBottom: "20px",
  },
};