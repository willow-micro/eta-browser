// System
import React, { useState, useEffect } from 'react';
// User
import 'ui-neumorphism/dist/index.css'
//import { overrideThemeVariables } from 'ui-neumorphism'
import { Alert, Card, CardContent, TextField, Button, H3, H6 } from 'ui-neumorphism'

// Main Component
const MainView = () => {

    // useState
    const [appMessage, setAppMessage] = useState("Welcome");


    // useEffect
    useEffect(() => {
    }, []);


    // onClicks
    const onOpenBrowserButton = () => {
        console.log("OpenBrowserButton");
        window.api.send("msg_render_to_main_ch1",  "OpenBrowser");
    };

    const onStartButton = () => {
        console.log("StartButton");
        window.api.send("msg_render_to_main_ch2", "Start");
    };

    // IPC Message Rx (from Main)
    window.api.on("Greeting", (event, arg) => {
        setAppMessage(arg.data);
    });


    // JSX
    return (
        <div style={{ display: 'flex', flexFlow: 'column', justifyContent: 'space-between' }}>
          {/* Debug */}
          <H3>セットアップ</H3>
          <Card style={{ margin: '4px' }}>
            <CardContent>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <H6>コンテンツ</H6>
                <TextField label="対象のURL" hideExtra={true}/>
              </div>
            </CardContent>
          </Card>
          <div style={{ padding: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button onClick={onOpenBrowserButton} style={{ margin: '4px' }}>ブラウザを開く</Button>
            <Button onClick={onStartButton} style={{ margin: '4px' }}>計測開始</Button>
          </div>
          <Alert inset type='info' border='top' style={{ margin: '4px' }}>
            {appMessage}
          </Alert>
        </div>
    );
};


// Function Componentは，宣言とは別途exportする必要がある．
// 同時にexportすると，正しくトランスパイルされない．これは通常のconst定数も同様かと思われる
export default MainView;
