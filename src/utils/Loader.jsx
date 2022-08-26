// import React from "react";

// const Loader = () => {
//   return (
//     <div className="flex justify-center items-center py-3">
//       <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-700">
//       </div>
//     </div>
//   );
// };

// export default Loader;

import React from "react";
import './Loader.css';

const Loader = () => {
  return (
    <div>
      <div className="center">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>
    </div>
  );
};

export default Loader;