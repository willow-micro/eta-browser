// System
import React from 'react';
// User


// Main Component
const MainView = () => {
    // JSX部
    // コメント部{ /* */ }もコンポーネントと見なされるため，React.Fragmentで囲っている
    return (
        <React.Fragment>
          {/* Debug */}
          <div>Hi from react! (Main)</div>
        </React.Fragment>
    );
};

// Function Componentは，宣言とは別途exportする必要がある．
// 同時にexportすると，正しくトランスパイルされない．これは通常のconst定数も同様かと思われる
export default MainView;
