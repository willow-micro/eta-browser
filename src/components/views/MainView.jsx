// System
import React, { useEffect } from 'react';
// User
import 'ui-neumorphism/dist/index.css'
//import { overrideThemeVariables } from 'ui-neumorphism'
import { Card, CardContent, TextField, Button, H3, H6 } from 'ui-neumorphism'

// Main Component
const MainView = () => {

    // useEffect
    useEffect(() => {
    }, []);

    // JSX
    return (
        <React.Fragment>
          {/* Debug */}
          <H3>セットアップ</H3>
          <Card style={{ margin: '4px' }}>
            <CardContent>
              <div style={{ padding: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <H6>コンテンツ</H6>
                <TextField label="対象のURL" hideExtra={true}/>
              </div>
            </CardContent>
          </Card>
          <Button style={{ margin: '4px' }}>実験開始...</Button>
        </React.Fragment>
    );
};

// Function Componentは，宣言とは別途exportする必要がある．
// 同時にexportすると，正しくトランスパイルされない．これは通常のconst定数も同様かと思われる
export default MainView;
