import React from 'react'
import { convertToIST } from '../Utils/convertToIST';

const DatePickerWithIST = () => {

// Convert UTC date to Indian Standard Time (IST)
const utcDate = "2025-01-21T07:26:56.356Z";

// Convert to IST (Indian Standard Time)
const istDate = convertToIST(utcDate)

console.log("Converted IST Date:", istDate);
  return (
    <div>DatePickerWithIST</div>
  )
}

export default DatePickerWithIST
