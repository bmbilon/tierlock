// This serverless function handles form submissions and sends emails via FormSubmit.co
// FormSubmit.co is a free service that doesn't require API keys

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = req.body;

    // Format the email body with all form data
    const emailContent = `
NEW TIERLOCK INTAKE FORM SUBMISSION
====================================

YOUR INFORMATION
----------------
Name: ${formData.name}
Email: ${formData.email}
Company: ${formData.company}
Website: ${formData.website || 'Not provided'}
Role: ${formData.role}

PRODUCT & MARKET
----------------
Product Overview:
${formData.productOverview}

Ideal Customer Profile:
${formData.icp}

Company Stage: ${formData.stage}
Current MRR: ${formData.mrr}

CURRENT PRICING
---------------
Current Pricing:
${formData.currentPricing || 'Not provided'}

Pricing Challenges:
${formData.pricingChallenges}

COMPETITIVE CONTEXT
-------------------
Top 3 Competitors:
${formData.competitors}

Differentiation:
${formData.differentiation || 'Not provided'}

ADDITIONAL CONTEXT
------------------
Desired Timeline: ${formData.timeline || 'Not specified'}

Additional Info:
${formData.additionalInfo || 'None provided'}

====================================
Submitted: ${new Date().toISOString()}
From: https://tierlock.ai
`;

    // Send email using FormSubmit.co
    // FormSubmit.co is a free service that forwards form data to email
    // No API key required, just use the email address as the endpoint
    const formSubmitResponse = await fetch('https://formsubmit.co/ajax/brett@execom.ca', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        subject: `New TierLock Intake: ${formData.company}`,
        message: emailContent,
        _replyto: formData.email,
        _template: 'box',
        _captcha: 'false'
      })
    });

    if (!formSubmitResponse.ok) {
      const errorText = await formSubmitResponse.text();
      console.error('FormSubmit error:', errorText);
      throw new Error('Email service failed');
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Form submitted successfully' 
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return res.status(500).json({ 
      error: 'Failed to process form submission',
      details: error.message 
    });
  }
}
