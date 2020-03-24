import React, { useState } from 'react';
import './Numpad.scss';

function Numpad(props) {
  return (
    <div id="numpad">
      <div className="column">
        <button className="btn btn-light" onClick={() => props.callback(props.employeeID + '1')}>1</button>
        <button className="btn btn-light" onClick={() => props.callback(props.employeeID + '4')}>4</button>
        <button className="btn btn-light" onClick={() => props.callback(props.employeeID + '7')}>7</button>
        <button className="btn btn-light" onClick={() => props.callback(props.employeeID.substring(0, props.employeeID.length - 1))}><i className="fas fa-arrow-left"></i></button>
      </div>
      <div className="column">
        <button className="btn btn-light" onClick={() => props.callback(props.employeeID + '2')}>2</button>
        <button className="btn btn-light" onClick={() => props.callback(props.employeeID + '5')}>5</button>
        <button className="btn btn-light" onClick={() => props.callback(props.employeeID + '8')}>8</button>
        <button className="btn btn-light" onClick={() => props.callback(props.employeeID + '9')}>0</button>
      </div>
      <div className="column">
        <button className="btn btn-light" onClick={() => props.callback(props.employeeID + '3')}>3</button>
        <button className="btn btn-light" onClick={() => props.callback(props.employeeID + '6')}>6</button>
        <button className="btn btn-light" onClick={() => props.callback(props.employeeID + '9')}>9</button>
        <button className="btn btn-light" onClick={() => props.callback(' ')}><i className="fas fa-remove"></i></button>
      </div>
    </div>
  );
}

export default Numpad
