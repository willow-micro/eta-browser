// System
import React, { useState, useEffect } from 'react';
// User

// Main Component
const MainView = () => {

    // useState


    // useEffect


    // IPC Message Rx (from Main)


    // JSX
    return (
        <React.Fragment>
          {/* WebView */}
          <div>Viewer</div>
        </React.Fragment>
    );
};


// Function Componentは，宣言とは別途exportする必要がある．
// 同時にexportすると，正しくトランスパイルされない．これは通常のconst定数も同様かと思われる
export default MainView;
