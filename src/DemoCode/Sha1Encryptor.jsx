import React, { useState } from 'react';
import SHA1 from 'crypto-js/sha1';
import { toast } from 'react-toastify';

function Sha1Encryptor() {
  const [input, setInput] = useState('');
  const [hashedValue, setHashedValue] = useState('');

  // Handle input changes
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // Handle form submission to hash input
  const handleSubmit = (e) => {
    e.preventDefault();
    const hash = SHA1(input).toString(); // Hashing the input with SHA1
    setHashedValue(hash); // Set the result to state
    toast.success("Password hashed successfully");
  };

  return (
    <div>
      <h2>SHA-1 Hash Generator</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Enter Text:
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Enter text to hash"
          />
        </label>
        <button type="submit">Hash Text</button>
      </form>
      {hashedValue && (
        <div>
          <h3>Hashed Value:</h3>
          <p>{hashedValue}</p>
        </div>
      )}
    </div>
  );
}

export default Sha1Encryptor;
