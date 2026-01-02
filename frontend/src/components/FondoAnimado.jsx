import React from 'react';
import Lottie from 'react-lottie-player';
import piggyBankJson from '../assets/piggy-bank.json';

const FondoAnimado = () => (
  <Lottie
    loop
    animationData={piggyBankJson}
    play
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 0,
      opacity: 0.15,
      pointerEvents: 'none',
    }}
  />
);

export default FondoAnimado;
