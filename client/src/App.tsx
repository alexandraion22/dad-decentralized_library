import React from "react";
import InjectiveWelcome from "./components/InjectiveWelcome";
import Navbar from "./components/Navbar";

type Props = {};

const App = (props: Props) => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Navbar />
      <div className="pt-16">
        <InjectiveWelcome />
      </div>
    </div>
  );
};

export default App;
