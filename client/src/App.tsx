import React from "react";
import InjectiveWelcome from "./components/InjectiveWelcome";

type Props = {};

const App = (props: Props) => {
  return (
    <div className='bg-gray-900 text-white'>
      <InjectiveWelcome />
    </div>
  );
};

export default App;
