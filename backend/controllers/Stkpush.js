const axios = require('axios');
const User = require('../models/User'); // Path to your User Schema

/**
 * Middleware: Generates Daraja API Access Token
 */
const generateAccessToken = async (req, res, next) => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  
  // Create Basic Auth string
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  try {
    const response = await axios.get(
      'https://safaricom.co.ke',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    
    req.mpesaToken = response.data.access_token;
    next();
  } catch (error) {
    console.error('Error generating access token:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to generate MPESA access token' });
  }
};

/**
 * Controller: Initiates the STK Push prompt on user's phone
 */
const initiateSTKPush = async (req, res) => {
  const { userId, amount, phoneNumber } = req.body;

  // 1. Format Validation
  if (!userId || !amount || !phoneNumber) {
    return res.status(400).json({ error: 'Missing required parameters: userId, amount, or phoneNumber' });
  }

  // Ensure phone number matches standard format: 2547XXXXXXXX or 2541XXXXXXXX
  let formattedPhone = phoneNumber.trim().replace('+', '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.slice(1);
  }

  if (!/^(2547|2541)\d{8}$/.test(formattedPhone)) {
    return res.status(400).json({ error: 'Invalid Kenyan phone number format. Use 2547XXXXXXXX or 2541XXXXXXXX' });
  }

  try {
    // 2. Daraja Parameter Construction
    const shortCode = process.env.MPESA_SHORTCODE; // e.g., 174379 for Sandbox
    const passKey = process.env.MPESA_PASSKEY;
    
    // Create current timestamp formatted as YYYYMMDDHHMMSS
    const date = new Date();
    const timestamp =
      date.getFullYear() +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      ('0' + date.getDate()).slice(-2) +
      ('0' + date.getHours()).slice(-2) +
      ('0' + date.getMinutes()).slice(-2) +
      ('0' + date.getSeconds()).slice(-2);

    // Password generation rule: Base64(ShortCode + PassKey + Timestamp)
    const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString('base64');
    
    // Destination URL where Safaricom sends payment results asynchronously
    const callbackUrl = `${process.env.SERVER_BASE_URL}/api/v1/mpesa/callback`;

    const stkPayload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline', // Or CustomerBuyGoodsOnline for Till
      Amount: Math.round(amount),
      PartyA: formattedPhone, // Customer paying
      PartyB: shortCode, // Business wallet receiving
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: `User_${userId.toString().slice(-6)}`, // Short unique string
      TransactionDesc: 'Wallet Top Up',
    };

    // 3. Make post request to Daraja Endpoint
    const url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    const response = await axios.post(url, stkPayload, {
      headers: {
        Authorization: `Bearer ${req.mpesaToken}`,
      },
    });

    // 4. On API Success, save request IDs into database user document
    if (response.data.ResponseCode === '0') {
      await User.findByIdAndUpdate(userId, {
        $set: {
          'mpesaInfo.phoneNumber': formattedPhone,
          'mpesaInfo.merchantRequestId': response.data.MerchantRequestID,
          'mpesaInfo.checkoutRequestId': response.data.CheckoutRequestID,
        },
      });

      return res.status(200).json({
        message: 'STK push initialized successfully. Please check your phone for the PIN prompt.',
        checkoutRequestId: response.data.CheckoutRequestID,
        merchantRequestId: response.data.MerchantRequestID,
      });
    } else {
      return res.status(400).json({ error: 'Daraja failed to initialize payment prompt', details: response.data });
    }

  } catch (error) {
    console.error('STK Push Error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Internal server error while initializing payment prompt' });
  }
};

module.exports = {
  generateAccessToken,
  initiateSTKPush,
};
