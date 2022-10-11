import React from "react";
import Datetime from 'react-datetime';


const DatePick = (props) => {

  const inputProps = {
    placeholder: props.name,
    style: { fontSize: "1rem" },
    label: "START",
  };

  return (
    <Datetime popperPlacement="top" inputProps={inputProps} timeFormat="HH:mm:ss" onChange={props.onChange} value={props.value} />
  )
}

export default DatePick